import * as XLSX from 'xlsx';

export interface LifeExpectancyData {
  year: number;
  value: number;
  category: string;
  subcategory: string;
}

export const readExcelFile = async (file: File): Promise<LifeExpectancyData[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        
        // Log available sheets
        console.log('Available sheets:', workbook.SheetNames);
        
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        // Get the range of the worksheet
        const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
        console.log('Worksheet range:', range);
        
        // Extract the data manually since the structure is complex
        const lifeExpectancyData: LifeExpectancyData[] = [];
        
        // First, identify the categories and subcategories
        let currentCategory = '';
        let currentSubcategory = '';
        
        // Process each row
        for (let R = range.s.r; R <= range.e.r; ++R) {
          const row: any = {};
          
          // Get all cells in this row
          for (let C = range.s.c; C <= range.e.c; ++C) {
            const cell = worksheet[XLSX.utils.encode_cell({ r: R, c: C })];
            if (cell) {
              const header = XLSX.utils.encode_col(C);
              row[header] = cell.v;
            }
          }
          
          // Check if this is a category row (contains "At birth" or "At 65 years" etc.)
          if (row['A'] && typeof row['A'] === 'string' && 
              (row['A'].includes('At birth') || row['A'].includes('At 65 years') || row['A'].includes('At 75 years'))) {
            currentCategory = row['A'];
            continue;
          }
          
          // Check if this is a subcategory row (contains "Female" or "Male" etc.)
          if (row[''] && typeof row[''] === 'string' && 
              (row[''].includes('Female') || row[''].includes('Male'))) {
            currentSubcategory = row[''];
            continue;
          }
          
          // Check if this is a data row (contains a year and a value)
          if (row['A'] && (typeof row['A'] === 'number' || 
              (typeof row['A'] === 'string' && /^\d{4}/.test(row['A'])))) {
            
            // Extract year (remove any non-numeric characters)
            const yearStr = String(row['A']).replace(/[^\d]/g, '');
            const year = parseInt(yearStr);
            
            // Extract value
            const value = row[''] !== undefined && row[''] !== '- - -' ? 
              parseFloat(String(row[''])) : null;
            
            if (year && !isNaN(year) && value !== null && !isNaN(value)) {
              lifeExpectancyData.push({
                year,
                value,
                category: currentCategory,
                subcategory: currentSubcategory
              });
            }
          }
        }
        
        console.log('Processed life expectancy data:', lifeExpectancyData);
        
        if (lifeExpectancyData.length === 0) {
          console.error('No valid data found in the Excel file');
          reject(new Error('No valid data found in the Excel file'));
          return;
        }
        
        resolve(lifeExpectancyData);
      } catch (error) {
        console.error('Error processing Excel file:', error);
        reject(error);
      }
    };
    
    reader.onerror = (error) => {
      console.error('Error reading file:', error);
      reject(error);
    };
    
    reader.readAsBinaryString(file);
  });
}; 