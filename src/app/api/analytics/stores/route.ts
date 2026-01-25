import { supabase } from '@/supabase'
import { NextResponse } from 'next/server'


export async function GET() {
  try {
    const { data, error } = await supabase
      .from('store_analytics')
      .select('*')
      .order('products_count', { ascending: false })

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch store analytics' },
      { status: 500 }
    )
  }
}