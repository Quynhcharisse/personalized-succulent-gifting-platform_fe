export function UserProfileValidation(form, originalForm = null) {
    const errors = {};

    // Name validation - only validate if name is being changed
    const currentName = (form.name || '').trim();
    const originalName = (originalForm?.name || '').trim();
    const nameChanged = currentName !== originalName;
    
    // Only validate name if it's being changed
    if (nameChanged) {
        if (!currentName || currentName.length === 0) {
            errors.name = 'Tên là bắt buộc';
        } else if (currentName.length < 3) {
            errors.name = 'Tên phải có ít nhất 3 ký tự';
        } else if (currentName.length > 100) {
            errors.name = 'Tên không được vượt quá 100 ký tự';
        }
    }

    // Phone validation - only validate if phone is being changed
    const currentPhone = (form.phone || '').trim();
    const originalPhone = (originalForm?.phone || '').trim();
    const phoneChanged = currentPhone !== originalPhone;
    
    if (phoneChanged) {
        if (!currentPhone || currentPhone.length === 0) {
            errors.phone = 'Số điện thoại là bắt buộc';
        } else if (!currentPhone.match(/^(0[1-9][0-9]{8,9}|\+84[1-9][0-9]{7,9})$/)) {
            errors.phone = 'Định dạng số điện thoại không hợp lệ';
        }
    }

    // Gender validation - only validate if gender is being changed
    const currentGender = (form.gender || '').trim();
    const originalGender = (originalForm?.gender || '').trim();
    const genderChanged = currentGender !== originalGender;
    
    if (genderChanged) {
        if (!currentGender || currentGender.length === 0) {
            errors.gender = 'Giới tính là bắt buộc';
        } else {
            const gender = currentGender.toUpperCase();
            if (!(gender === "MALE" || gender === "FEMALE")) {
                errors.gender = 'Giới tính không hợp lệ';
            }
        }
    }

    // Address validation - only validate if address is being changed
    const currentAddress = (form.address || '').trim();
    const originalAddress = (originalForm?.address || '').trim();
    const addressChanged = currentAddress !== originalAddress;
    
    if (addressChanged) {
        if (!currentAddress || currentAddress.length === 0) {
            errors.address = 'Địa chỉ là bắt buộc';
        } else if (currentAddress.length > 255) {
            errors.address = 'Địa chỉ không vượt quá 255 ký tự';
        }
    }

    // Avatar URL validation - only validate format if avatarUrl is provided and changed
    const currentAvatarUrl = (form.avatarUrl || '').trim();
    const originalAvatarUrl = (originalForm?.avatarUrl || '').trim();
    const avatarUrlChanged = currentAvatarUrl !== originalAvatarUrl;
    
    // Only validate avatarUrl format if it's being changed and has a value
    if (avatarUrlChanged && currentAvatarUrl) {
        const lower = currentAvatarUrl.toLowerCase();
        // Check if it's a URL (starts with http/https) or a file extension
        const isUrl = lower.startsWith('http://') || lower.startsWith('https://');
        const hasValidExtension = lower.endsWith('.jpg') || lower.endsWith('.jpeg') ||
            lower.endsWith('.png') || lower.endsWith('.gif') ||
            lower.endsWith('.webp');
        
        // If it's a URL, we assume it's valid (Cloudinary URLs don't always have extensions)
        // If it's not a URL, it must have a valid image extension
        if (!isUrl && !hasValidExtension) {
            errors.avatarUrl = 'URL ảnh đại diện phải là hình ảnh (jpg, jpeg, png, gif, webp)';
        }
    }

    return errors;
}
