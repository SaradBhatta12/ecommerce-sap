# Excel Import Guide for Location Management

This guide explains how to import location data into the admin panel using Excel files.

## Overview

The location management system supports importing hierarchical location data from Excel files. This feature allows you to bulk import countries, provinces, cities, and landmarks with their shipping prices.

## Excel File Format

### Required Columns

Your Excel file must contain the following columns in this exact order:

| Column | Header | Description | Required | Example |
|--------|--------|-------------|----------|---------|
| A | ID | Location ID (auto-generated, can be left empty for import) | No | 507f1f77bcf86cd799439011 |
| B | Name | Location name (auto-extracted from path) | No | Kathmandu |
| C | Type | Location type (auto-determined from hierarchy) | No | city |
| D | Path | **MOST IMPORTANT** - Hierarchical path using "/" separator | **Yes** | Nepal/Bagmati/Kathmandu |
| E | Shipping Price | Shipping cost (only applies to landmarks) | No | 150 |

### Path Format Rules

1. **Hierarchical Structure**: Use forward slashes ("/") to separate hierarchy levels
2. **Four Levels Maximum**: Country/Province/City/Landmark
3. **Case Sensitive**: "Kathmandu" and "kathmandu" are treated as different locations
4. **No Leading/Trailing Slashes**: Use `Nepal/Bagmati` not `/Nepal/Bagmati/`

### Location Types (Auto-Determined)

- **Country**: 1 level - `Nepal`
- **Province**: 2 levels - `Nepal/Bagmati`
- **City**: 3 levels - `Nepal/Bagmati/Kathmandu`
- **Landmark**: 4 levels - `Nepal/Bagmati/Kathmandu/Thamel`

## Sample Excel Data

### Example 1: Complete Location Hierarchy

| ID | Name | Type | Path | Shipping Price |
|----|------|------|------|----------------|
| | Nepal | country | Nepal | 0 |
| | Bagmati | province | Nepal/Bagmati | 0 |
| | Gandaki | province | Nepal/Gandaki | 0 |
| | Kathmandu | city | Nepal/Bagmati/Kathmandu | 0 |
| | Pokhara | city | Nepal/Gandaki/Pokhara | 0 |
| | Thamel | landmark | Nepal/Bagmati/Kathmandu/Thamel | 150 |
| | Lakeside | landmark | Nepal/Gandaki/Pokhara/Lakeside | 200 |
| | New Road | landmark | Nepal/Bagmati/Kathmandu/New Road | 120 |

### Example 2: Minimal Required Data (Path Only)

| ID | Name | Type | Path | Shipping Price |
|----|------|------|------|----------------|
| | | | Nepal | |
| | | | Nepal/Bagmati | |
| | | | Nepal/Bagmati/Kathmandu | |
| | | | Nepal/Bagmati/Kathmandu/Thamel | 150 |
| | | | Nepal/Bagmati/Kathmandu/New Road | 120 |

## Import Process

### Step 1: Prepare Your Excel File

1. Create a new Excel file (.xlsx format)
2. Add the required column headers in row 1
3. Fill in your location data starting from row 2
4. Ensure all paths follow the hierarchical format
5. Add shipping prices for landmarks (optional for other types)

### Step 2: Import via Admin Panel

1. Navigate to `/admin/locations` in your admin panel
2. Click the **Upload** button (📤 icon)
3. Select your prepared Excel file
4. Click "Import" to start the process
5. Wait for the success confirmation

### Step 3: Verify Import

1. Check the location tree in the admin panel
2. Verify all hierarchical relationships are correct
3. Confirm shipping prices are applied to landmarks

## Important Notes

### ⚠️ Data Replacement Warning

**The import process will DELETE all existing locations for the current admin user and replace them with the imported data.** Make sure to export your current data before importing if you want to keep it.

### Shipping Prices

- Only **landmarks** (4th level) can have shipping prices
- Shipping prices for countries, provinces, and cities are ignored
- If no shipping price is specified for landmarks, it defaults to 0
- Shipping prices should be numeric values (e.g., 150, 200.50)

### Error Handling

- Invalid file formats will be rejected
- Missing or malformed paths will cause import failure
- Duplicate paths within the same file will overwrite each other
- Non-numeric shipping prices will default to 0

## Export Current Data

Before importing new data, you can export your current locations:

1. Go to `/admin/locations`
2. Click the **Download** button (📥 icon)
3. Save the generated Excel file as a backup

## Troubleshooting

### Common Issues

1. **Import Failed**: Check that your Excel file has the correct column structure
2. **Missing Locations**: Ensure all parent locations are included in the hierarchy
3. **Wrong Shipping Prices**: Verify that shipping prices are only set for landmarks
4. **Hierarchy Errors**: Check that paths use forward slashes and follow the 4-level structure

### File Format Requirements

- **Supported Format**: .xlsx (Excel 2007+)
- **Maximum File Size**: 10MB (recommended)
- **Character Encoding**: UTF-8 (for international characters)
- **Special Characters**: Avoid using "/" in location names as it's used for path separation

## Best Practices

1. **Start Small**: Test with a few locations first
2. **Consistent Naming**: Use consistent spelling and capitalization
3. **Backup First**: Always export current data before importing
4. **Validate Data**: Double-check paths and shipping prices before import
5. **Incremental Updates**: For large datasets, consider importing in smaller batches

## Sample Template

You can download a sample Excel template with the correct format from the admin panel or create one using the structure shown above.

---

**Need Help?** Contact your system administrator if you encounter issues during the import process.