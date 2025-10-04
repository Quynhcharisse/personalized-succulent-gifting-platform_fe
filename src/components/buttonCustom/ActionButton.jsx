import React from 'react';
import {COLORS} from "../constants.js";
import {Button, CircularProgress} from "@mui/material";

export default function ActionButton({
    action = 'primary',
    loading = false,
    disabled = false,
    type = 'button',
    onClick,
    children,
    startIcon,
    endIcon,
    sx,
    ...rest
}) {
    // Xử lý mặc định cho các action
    const handleDefaultAction = () => {
        switch (action) {
            case 'close':
                // Đóng dialog/modal gần nhất nếu có
                if (window.closeCurrentDialog) {
                    window.closeCurrentDialog();
                }
                break;
            case 'cancel':
                // Trigger sự kiện cancel mặc định
                if (window.cancelCurrentAction) {
                    window.cancelCurrentAction();
                }
                break;
        }
        // Gọi onClick callback nếu được cung cấp
        onClick?.();
    };

    // palette dựa trên COLORS
    const palette = {
        close:  { bg: COLORS.info, text: COLORS.surface },
        cancel: { bg: COLORS.error, text: COLORS.surface },
        update: { bg: COLORS.warning, text: COLORS.surface },
        create: { bg: COLORS.success, text: COLORS.surface },
        primary:{ bg: COLORS.primary, text: COLORS.surface },
    }[action];

    // label mặc định theo action (có thể override bằng children)
    const defaultLabel = {
        close: 'Đóng',
        cancel: 'Hủy',
        update: 'Cập nhật',
        create: 'Tạo mới',
        primary: 'Xác nhận',
    }[action];

    // đảm bảo không submit form ngoài ý muốn khi là nút đóng
    const resolvedType = type ?? (action === 'create' || action === 'update' ? 'submit' : 'button');

    return (
        <Button
            type={resolvedType}
            variant="contained"
            disabled={disabled || loading}
            onClick={handleDefaultAction}
            startIcon={!loading ? startIcon : undefined}
            endIcon={!loading ? endIcon : undefined}
            sx={{
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                backgroundColor: palette.bg,
                color: palette.text,
                '&:hover': {
                    backgroundColor: palette.bg,
                    opacity: 0.9,
                },
                ...sx,
            }}
            {...rest}
        >
            {loading ? (
                <>
                    <CircularProgress size={20} sx={{ mr: 1, color: COLORS.surface }} />
                    Đang xử lý...
                </>
            ) : (
                children ?? defaultLabel
            )}
        </Button>
    );
}