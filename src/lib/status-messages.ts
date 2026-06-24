export const getUserStatusMessage = (status?: string) => {
    switch (status) {
        case 'PENDING':
            return 'Tài khoản chưa được kích hoạt. Vui lòng kiểm tra email để nhập mã xác thực.';
        case 'INACTIVE':
            return 'Tài khoản của bạn đang bị tạm ngưng. Vui lòng liên hệ quản trị viên.';
        case 'BANNED':
            return 'Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.';
        default:
            return 'Tài khoản không còn hoạt động. Vui lòng đăng nhập lại hoặc liên hệ quản trị viên.';
    }
};

export const getShopStatusMessage = (status?: string) => {
    switch (status) {
        case 'PENDING':
            return 'Đăng ký shop của bạn đang chờ quản trị viên xét duyệt.';
        case 'INACTIVE':
            return 'Shop của bạn đang bị tạm ngưng hoạt động. Vui lòng liên hệ quản trị viên.';
        case 'BANNED':
            return 'Shop của bạn đã bị khóa. Vui lòng liên hệ quản trị viên để biết thêm chi tiết.';
        case 'REJECTED':
            return 'Đăng ký shop của bạn đã bị từ chối. Vui lòng kiểm tra lại thông tin hoặc liên hệ quản trị viên.';
        default:
            return 'Shop hiện chưa thể truy cập kênh bán hàng.';
    }
};
