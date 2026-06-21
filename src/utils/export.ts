import * as XLSX from 'xlsx';

interface ExportExcelParams {
    data: any[];
    fileName: string;
    sheetName?: string;
    headers?: string[];
}

export const exportToExcel = ({ data, fileName, sheetName = 'Thống kê', headers }: ExportExcelParams) => {
    // 1. Tạo một Workbook mới (file Excel trống)
    const workbook = XLSX.utils.book_new();

    // 2. Chuyển đổi mảng Object thành dữ liệu bảng của Excel (Worksheet)
    // Nếu có custom headers thì tạo bảng trống trước rồi đắp data sau, còn không thì tự lấy key làm header
    const worksheet = XLSX.utils.json_to_sheet(data);

    // 3. Định dạng lại Header nếu được truyền vào (Tiếng Việt có dấu cho đẹp)
    if (headers && headers.length > 0) {
        XLSX.utils.sheet_add_aoa(worksheet, [headers], { origin: 'A1' });
    }

    // Cấu hình độ rộng tự động cho các cột dựa trên độ dài chữ
    const objectMaxWidth: number[] = [];
    data.forEach((row) => {
        Object.values(row).forEach((val: any, colIdx) => {
            const textLength = val ? val.toString().length : 10;
            objectMaxWidth[colIdx] = Math.max(objectMaxWidth[colIdx] || 10, textLength);
        });
    });
    worksheet['!cols'] = objectMaxWidth.map(w => ({ wch: w + 5 })); // Cộng thêm padding rải rác

    // 4. Đưa Worksheet vào Workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    // 5. Xuất file và kích hoạt trình duyệt tự động tải về (.xlsx)
    XLSX.writeFile(workbook, `${fileName}_${new Date().toLocaleDateString('vi-VN').replace(/\//g, '-')}.xlsx`);
};