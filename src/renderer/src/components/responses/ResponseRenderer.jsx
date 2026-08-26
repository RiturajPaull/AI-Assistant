import CpuCard from './CpuCard'
import MemoryCard from './MemoryCard'
import BatteryCard from './BatteryCard'
import ProcessCard from './ProcessCard'
import TextCard from './TextCard'
import AppCard from './AppCard'

function ResponseRenderer({ response }) {
  if (!response) {
    return null
  }

  switch (response.type) {
    case 'cpu':
      return <CpuCard data={response.data} />

    case 'memory':
      return <MemoryCard data={response.data} />

    case 'battery':
      return <BatteryCard data={response.data} />

    case 'process':
      return <ProcessCard data={response.data} />

    case 'app':
      return <AppCard data={response.data} />

    case 'text':
      return <TextCard data={response.data} />

    default:
      return null
  }
}

export default ResponseRenderer
