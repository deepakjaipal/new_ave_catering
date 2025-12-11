'use client';

import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  FileSpreadsheet, 
  Database, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  Download,
  Eye,
  Settings
} from 'lucide-react';
import { toast } from 'sonner';
import { 
  uploadExcelFile, 
  getImportPreview, 
  importCategories, 
  importProducts,
  ColumnMapping 
} from '@/lib/api/services/importService';

interface ImportData {
  data: any[];
  totalRows: number;
  columns: string[];
}

export default function ImportPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [importData, setImportData] = useState<ImportData | null>(null);
  const [preview, setPreview] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'upload' | 'preview' | 'import'>('upload');
  const [importType, setImportType] = useState<'categories' | 'products'>('products');
  const [columnMapping, setColumnMapping] = useState<ColumnMapping>({
    name: 'Product Name',
    category: 'Category',
    brand: 'Brand',
    price: 'Price',
    sku: 'SKU',
    description: 'Description',
    packSize: 'Pack Size',
    unit: 'Unit',
    stockQuantity: 'Stock Quantity',
    pricePerCase: 'Price Per Case'
  });
  const [importResult, setImportResult] = useState<any>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type.includes('sheet') || selectedFile.name.endsWith('.xlsx') || selectedFile.name.endsWith('.xls')) {
        setFile(selectedFile);
      } else {
        toast.error('Please select an Excel file (.xlsx or .xls)');
      }
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    try {
      setLoading(true);
      const result = await uploadExcelFile(file);
      setImportData(result);
      setStep('preview');
      toast.success('File uploaded successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error uploading file');
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = async () => {
    if (!importData) return;

    try {
      setLoading(true);
      const result = await getImportPreview(importData.data, importType);
      setPreview(result.preview);
      toast.success('Preview generated successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error generating preview');
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    if (!importData) return;

    try {
      setLoading(true);
      let result;
      
      if (importType === 'categories') {
        result = await importCategories(importData.data);
      } else {
        result = await importProducts(importData.data, columnMapping);
      }
      
      setImportResult(result);
      setStep('import');
      toast.success(`${importType} imported successfully!`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error importing data');
    } finally {
      setLoading(false);
    }
  };

  const resetImport = () => {
    setFile(null);
    setImportData(null);
    setPreview([]);
    setStep('upload');
    setImportResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const downloadTemplate = () => {
    // Create a simple CSV template
    const template = importType === 'categories' 
      ? 'Category\nBeverages\nSnacks\nCleaning & Laundry\nGrocery\nHealth & Beauty'
      : 'Product Name,Category,Brand,Price,SKU,Description,Pack Size,Unit,Stock Quantity,Price Per Case\n"Sample Product","Beverages","Sample Brand",1.50,"SKU001","Sample description","12 Pack","ea",100,18.00';
    
    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${importType}-template.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Data Import</h1>
          <p className="text-muted-foreground mt-1">
            Import categories and products from Excel files
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={downloadTemplate}>
            <Download className="h-4 w-4 mr-2" />
            Download Template
          </Button>
        </div>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center space-x-4">
        <div className={`flex items-center space-x-2 ${step === 'upload' ? 'text-primary' : step === 'preview' || step === 'import' ? 'text-green-600' : 'text-muted-foreground'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'upload' ? 'bg-primary text-primary-foreground' : step === 'preview' || step === 'import' ? 'bg-green-600 text-white' : 'bg-muted'}`}>
            {step === 'preview' || step === 'import' ? <CheckCircle className="h-4 w-4" /> : '1'}
          </div>
          <span className="font-medium">Upload File</span>
        </div>
        <div className="w-8 h-px bg-border"></div>
        <div className={`flex items-center space-x-2 ${step === 'preview' ? 'text-primary' : step === 'import' ? 'text-green-600' : 'text-muted-foreground'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'preview' ? 'bg-primary text-primary-foreground' : step === 'import' ? 'bg-green-600 text-white' : 'bg-muted'}`}>
            {step === 'import' ? <CheckCircle className="h-4 w-4" /> : '2'}
          </div>
          <span className="font-medium">Preview & Configure</span>
        </div>
        <div className="w-8 h-px bg-border"></div>
        <div className={`flex items-center space-x-2 ${step === 'import' ? 'text-primary' : 'text-muted-foreground'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'import' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
            3
          </div>
          <span className="font-medium">Import Data</span>
        </div>
      </div>

      {/* Upload Step */}
      {step === 'upload' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload Excel File
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <FileSpreadsheet className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Choose Excel File</h3>
                <p className="text-muted-foreground">
                  Select an Excel file (.xlsx or .xls) containing your data
                </p>
                <Input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileSelect}
                  className="max-w-xs mx-auto"
                />
              </div>
            </div>

            {file && (
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  <FileSpreadsheet className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="font-medium">{file.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <Button onClick={handleUpload} disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload File
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Preview Step */}
      {step === 'preview' && importData && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                File Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">File Name</p>
                  <p className="font-medium">{file?.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Rows</p>
                  <p className="font-medium">{importData.totalRows}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Columns</p>
                  <p className="font-medium">{importData.columns.length}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Import Type</p>
                  <Badge variant="outline">{importType}</Badge>
                </div>
              </div>

              <div className="flex gap-2 mb-4">
                <Button
                  variant={importType === 'products' ? 'default' : 'outline'}
                  onClick={() => setImportType('products')}
                >
                  Products
                </Button>
                <Button
                  variant={importType === 'categories' ? 'default' : 'outline'}
                  onClick={() => setImportType('categories')}
                >
                  Categories
                </Button>
              </div>

              <Button onClick={handlePreview} disabled={loading} className="mb-4">
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating Preview...
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4 mr-2" />
                    Generate Preview
                  </>
                )}
              </Button>

              {preview.length > 0 && (
                <div className="border rounded-lg overflow-hidden">
                  <div className="bg-muted p-3">
                    <h4 className="font-medium">Preview Data ({preview.length} items)</h4>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          {Object.keys(preview[0] || {}).map((key) => (
                            <th key={key} className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                              {key}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {preview.slice(0, 5).map((item, index) => (
                          <tr key={index} className="border-t">
                            {Object.values(item).map((value, idx) => (
                              <td key={idx} className="px-4 py-2 text-sm">
                                {String(value)}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Column Mapping for Products */}
          {importType === 'products' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Column Mapping
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(columnMapping).map(([key, value]) => (
                    <div key={key}>
                      <label className="text-sm font-medium capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </label>
                      <select
                        value={value}
                        onChange={(e) => setColumnMapping(prev => ({ ...prev, [key]: e.target.value }))}
                        className="w-full mt-1 p-2 border rounded-md"
                      >
                        <option value="">Select Column</option>
                        {importData.columns.map((col) => (
                          <option key={col} value={col}>{col}</option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex gap-2">
            <Button onClick={handleImport} disabled={loading || preview.length === 0}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <Database className="h-4 w-4 mr-2" />
                  Import {importType}
                </>
              )}
            </Button>
            <Button variant="outline" onClick={resetImport}>
              Start Over
            </Button>
          </div>
        </div>
      )}

      {/* Import Result */}
      {step === 'import' && importResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Import Complete
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-600" />
                <p className="text-2xl font-bold text-green-600">{importResult.created}</p>
                <p className="text-sm text-muted-foreground">Created</p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <AlertCircle className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                <p className="text-2xl font-bold text-blue-600">{importResult.existing}</p>
                <p className="text-sm text-muted-foreground">Already Existed</p>
              </div>
              {importResult.errors > 0 && (
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <AlertCircle className="h-8 w-8 mx-auto mb-2 text-red-600" />
                  <p className="text-2xl font-bold text-red-600">{importResult.errors}</p>
                  <p className="text-sm text-muted-foreground">Errors</p>
                </div>
              )}
            </div>

            {importResult.errorDetails && importResult.errorDetails.length > 0 && (
              <div className="p-4 bg-red-50 rounded-lg">
                <h4 className="font-medium text-red-800 mb-2">Errors:</h4>
                <ul className="text-sm text-red-700 space-y-1">
                  {importResult.errorDetails.map((error: string, index: number) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex gap-2">
              <Button onClick={resetImport}>
                Import Another File
              </Button>
              <Button variant="outline" onClick={() => window.location.href = '/admin/products'}>
                View Products
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
