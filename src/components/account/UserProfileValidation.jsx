export function UserProfileValidation(form) {
    const errors = {};

    // Name validation
    if (!form.name || form.name.trim().length === 0) {
        errors.name = 'Tên là bắt buộc';
    } else if (form.name.trim().length < 3) {
        errors.name = 'Tên phải có ít nhất 3 ký tự';
    } else if (form.name.length > 100) {
        errors.name = 'Tên không được vượt quá 100 ký tự';
    }

    // Phone validation (Vietnamese format)
    if (!form.phone || form.phone.trim().length === 0) {
        errors.phone = 'Số điện thoại là bắt buộc';
    } else if (!form.phone.match(/^(0[1-9][0-9]{8,9}|\+84[1-9][0-9]{7,9})$/)) {
        errors.phone = 'Định dạng số điện thoại không hợp lệ';
    }

    // Gender validation
    if (!form.gender || form.gender.trim().length === 0) {
        errors.gender = 'Giới tính là bắt buộc';
    } else {
        const gender = form.gender.toUpperCase();
        if (!(gender === "MALE" || gender === "FEMALE")) {
            errors.gender = 'Giới tính không hợp lệ';
        }
    }

    // Address validation
    if (!form.address || form.address.trim().length === 0) {
        errors.address = 'Địa chỉ là bắt buộc';
    } else if (form.address.length > 255) {
        errors.address = 'Địa chỉ không vượt quá 255 ký tự';
    }

    // Avatar URL validation
    const lower = form.avatarUrl.toLowerCase();
    if (!(lower.endsWith('.jpg') || lower.endsWith('.jpeg') ||
        lower.endsWith('.png') || lower.endsWith('.gif') ||
        lower.endsWith('.webp'))) {
        errors.avatarUrl = 'URL ảnh đại diện phải là hình ảnh (jpg, jpeg, png, gif, webp)';
    }

    return errors;
}
