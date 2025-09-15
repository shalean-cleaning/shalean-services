export const formatZAR = (cents: number) =>
  new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' })
    .format((cents || 0) / 100);