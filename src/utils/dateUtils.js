import { format } from 'date-fns'

export const formatDate = (timestamp) => {
  return format(new Date(timestamp * 1000), 'PPP p')
}
