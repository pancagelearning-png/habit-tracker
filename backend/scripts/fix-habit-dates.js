require('dotenv').config({ path: require('path').join(__dirname, '../.env') })

const { supabase } = require('../supabase')

async function fixHabitDates() {
  const { data, error } = await supabase
    .from('habits')
    .update({ start_date: '2026-03-15', end_date: '2026-03-30' })
    .is('start_date', null)
    .select('id')

  if (error) {
    console.error('Error updating habits:', error.message)
    process.exit(1)
  }

  console.log(`Updated ${data.length} habit(s) with start_date=2026-03-15 and end_date=2026-03-30`)
}

fixHabitDates()
