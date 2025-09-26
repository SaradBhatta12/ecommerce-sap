import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/db-connect';
import Currency from '@/models/currency';

// GET - Fetch all currencies
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    await dbConnect();

    const currencies = await Currency.find({}).sort({ isDefault: -1, name: 1 });

    return NextResponse.json({
      success: true,
      currencies,
    });

  } catch (error) {
    console.error('Error fetching currencies:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch currencies' },
      { status: 500 }
    );
  }
}

// POST - Create new currency
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, code, symbol, exchangeRate, isActive, isDefault } = body;

    // Validate required fields
    if (!name || !code || !symbol || exchangeRate === undefined) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Check if currency code already exists
    const existingCurrency = await Currency.findOne({ code: code.toUpperCase() });
    if (existingCurrency) {
      return NextResponse.json(
        { success: false, message: 'Currency code already exists' },
        { status: 400 }
      );
    }

    const currency = new Currency({
      name,
      code: code.toUpperCase(),
      symbol,
      exchangeRate: parseFloat(exchangeRate),
      isActive: isActive !== undefined ? isActive : true,
      isDefault: isDefault || false,
    });

    await currency.save();

    return NextResponse.json({
      success: true,
      message: 'Currency created successfully',
      currency,
    });

  } catch (error) {
    console.error('Error creating currency:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create currency' },
      { status: 500 }
    );
  }
}

// PUT - Update currency
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { id, name, code, symbol, exchangeRate, isActive, isDefault } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Currency ID is required' },
        { status: 400 }
      );
    }

    await dbConnect();

    const currency = await Currency.findById(id);
    if (!currency) {
      return NextResponse.json(
        { success: false, message: 'Currency not found' },
        { status: 404 }
      );
    }

    // Update fields
    if (name) currency.name = name;
    if (code) currency.code = code.toUpperCase();
    if (symbol) currency.symbol = symbol;
    if (exchangeRate !== undefined) currency.exchangeRate = parseFloat(exchangeRate);
    if (isActive !== undefined) currency.isActive = isActive;
    if (isDefault !== undefined) currency.isDefault = isDefault;

    await currency.save();

    return NextResponse.json({
      success: true,
      message: 'Currency updated successfully',
      currency,
    });

  } catch (error) {
    console.error('Error updating currency:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update currency' },
      { status: 500 }
    );
  }
}

// DELETE - Delete currency
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Currency ID is required' },
        { status: 400 }
      );
    }

    await dbConnect();

    const currency = await Currency.findById(id);
    if (!currency) {
      return NextResponse.json(
        { success: false, message: 'Currency not found' },
        { status: 404 }
      );
    }

    // Prevent deletion of default currency
    if (currency.isDefault) {
      return NextResponse.json(
        { success: false, message: 'Cannot delete default currency' },
        { status: 400 }
      );
    }

    await Currency.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: 'Currency deleted successfully',
    });

  } catch (error) {
    console.error('Error deleting currency:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete currency' },
      { status: 500 }
    );
  }
}