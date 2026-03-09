import BotaoUpload from '../componentes/BotaoUpload.jsx'

/**
 * Página inicial: tela de upload de arquivos.
 * Renderiza sobre o dashboard enquanto nenhum dado foi processado.
 */
export default function Inicio({ fileQueue, onAddFiles, onProcess, onDemo, feedback }) {
  return (
    <BotaoUpload
      fileQueue={fileQueue}
      onAddFiles={onAddFiles}
      onProcess={onProcess}
      onDemo={onDemo}
      feedback={feedback}
    />
  )
}
