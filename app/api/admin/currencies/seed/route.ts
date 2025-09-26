import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/db-connect';
import Currency from '@/models/currency';

const defaultCurrencies = [
  {
    name: 'Nepali Rupee',
    code: 'NPR',
    symbol: 'रू',
    exchangeRate: 1,
    isActive: true,
    isDefault: true,
  },
  {
    name: 'US Dollar',
    code: 'USD',
    symbol: '$',
    exchangeRate: 0.0075, // 1 NPR = 0.0075 USD (approximate)
    isActive: true,
    isDefault: false,
  },
  {
    name: 'Indian Rupee',
    code: 'INR',
    symbol: '₹',
    exchangeRate: 0.625, // 1 NPR = 0.625 INR (approximate)
    isActive: true,
    isDefault: false,
  },
  {
    name: 'Euro',
    code: 'EUR',
    symbol: '€',
    exchangeRate: 0.007, // 1 NPR = 0.007 EUR (approximate)
    isActive: true,
    isDefault: false,
  },
];

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    await dbConnect();

    // Check if currencies already exist
    const existingCurrencies = await Currency.find({});
    if (existingCurrencies.length > 0) {
      return NextResponse.json(
        { success: false, message: 'Currencies already seeded' },
        { status: 400 }
      );
    }

    // Create default currencies
    const currencies = await Currency.insertMany(defaultCurrencies);

    return NextResponse.json({
      success: true,
      message: 'Default currencies seeded successfully',
      currencies,
    });

  } catch (error) {
    console.error('Error seeding currencies:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to seed currencies' },
      { status: 500 }
    );
  }
}