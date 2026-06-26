import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'
import mime from 'mime-types'

// Load environment variables
const envFile = fs.existsSync('.env.production.backup') ? '.env.production.backup' : '.env.local'
dotenv.config({ path: envFile })
console.log(`Usando variáveis de ambiente do arquivo: ${envFile}`)

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY // Need service role to bypass RLS

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

const BUCKET_NAME = 'aulas-arquivos'
const BUCKET_PREFIX = 'ferramentas-html'
const SOURCE_DIR = path.join(process.cwd(), 'public', 'ferramentas')

async function walkDir(dir, fileList = []) {
  const files = await fs.promises.readdir(dir)
  for (const file of files) {
    const filePath = path.join(dir, file)
    const stat = await fs.promises.stat(filePath)
    if (stat.isDirectory()) {
      await walkDir(filePath, fileList)
    } else {
      fileList.push(filePath)
    }
  }
  return fileList
}

async function migrate() {
  console.log(`Buscando simuladores em: ${SOURCE_DIR}`)
  
  if (!fs.existsSync(SOURCE_DIR)) {
    console.log('Pasta public/ferramentas não encontrada. Nada para migrar.')
    return
  }

  const files = await walkDir(SOURCE_DIR)
  console.log(`Encontrados ${files.length} arquivos.`)

  // 1. Upload das pastas
  const uploadedUrls = new Map() // Mapeia url relativa -> url publica do supabase
  
  for (const filePath of files) {
    const relativePath = path.relative(SOURCE_DIR, filePath)
    // Convert backslashes to forward slashes for storage path
    const posixPath = relativePath.split(path.sep).join(path.posix.sep)
    const storagePath = `${BUCKET_PREFIX}/${posixPath}`
    
    console.log(`Fazendo upload: ${posixPath}`)
    
    const fileBuffer = await fs.promises.readFile(filePath)
    const mimeType = mime.lookup(filePath) || 'application/octet-stream'
    
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(storagePath, fileBuffer, {
        contentType: mimeType,
        upsert: true
      })
      
    if (error) {
      console.error(`Erro ao fazer upload de ${posixPath}:`, error)
      continue
    }

    if (posixPath.endsWith('index.html')) {
      // É um arquivo principal, guardamos a URL para atualizar o banco
      const { data: { publicUrl } } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(storagePath)
        
      // A url antiga era "/ferramentas/[pasta]/index.html"
      const oldUrl = `/ferramentas/${posixPath}`
      uploadedUrls.set(oldUrl, publicUrl)
    }
  }

  console.log('\nUploads concluídos. Inciando atualização no banco de dados...\n')

  // 2. Atualizar no Banco de Dados
  // Vamos buscar todos os recursos do tipo 'simulador' (ou que tenham /ferramentas/ na url)
  const { data: recursos, error: fetchError } = await supabase
    .from('recursos')
    .select('id, titulo, arquivo_url')
    .like('arquivo_url', '%/ferramentas/%')

  if (fetchError) {
    console.error('Erro ao buscar recursos:', fetchError)
    return
  }

  console.log(`Encontrados ${recursos.length} recursos no BD usando URLs relativas.`)

  for (const recurso of recursos) {
    // Normalizar a url do BD (pode não ter leading slash em alguns casos, ou ser igual)
    const bdUrl = recurso.arquivo_url
    
    // Tenta casar a URL antiga com a nova
    let newUrl = null
    for (const [oldUrl, pubUrl] of uploadedUrls.entries()) {
      // Se a url do BD for exatamente a oldUrl ou conter ela (ex: domain.com/ferramentas...)
      if (bdUrl === oldUrl || bdUrl.endsWith(oldUrl)) {
        newUrl = pubUrl
        break
      }
    }

    if (newUrl) {
      console.log(`Atualizando "${recurso.titulo}": \n De: ${bdUrl} \n Para: ${newUrl}`)
      const { error: updateError } = await supabase
        .from('recursos')
        .update({ arquivo_url: newUrl })
        .eq('id', recurso.id)
        
      if (updateError) {
        console.error(`Erro ao atualizar ${recurso.titulo}:`, updateError)
      }
    } else {
      console.log(`⚠️ Não encontrei o novo link para: ${recurso.titulo} (URL Atual: ${bdUrl})`)
    }
  }

  console.log('\nMigração Concluída!')
}

migrate().catch(console.error)
