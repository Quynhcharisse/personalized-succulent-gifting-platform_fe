export function UserProfileValidation(form, originalForm = null) {
    const errors = {};

    // Name validation - only validate if name is being changed
    const currentName = (form.name || '').trim();
    const originalName = (originalForm?.name || '').trim();
    const nameChanged = currentName !== originalName;
    
    // Only validate name if it's being changed
    if (nameChanged) {
        if (!currentName || currentName.length === 0) {
            errors.name = 'Vui lòng nhập họ và tên của bạn';
        } else if (currentName.length < 3) {
            errors.name = `Tên quá ngắn (${currentName.length}/3 ký tự). Vui lòng nhập ít nhất 3 ký tự`;
        } else if (currentName.length > 100) {
            errors.name = `Tên quá dài (${currentName.length}/100 ký tự). Vui lòng rút ngắn lại`;
        } else if (!/^[\p{L}\s]+$/u.test(currentName)) {
            errors.name = 'Tên chỉ được chứa chữ cái và khoảng trắng, không có ký tự đặc biệt hoặc số';
        }
    }

    // Phone validation - only validate if phone is being changed
    const currentPhone = (form.phone || '').trim();
    const originalPhone = (originalForm?.phone || '').trim();
    const phoneChanged = currentPhone !== originalPhone;
    
    if (phoneChanged) {
        if (!currentPhone || currentPhone.length === 0) {
            errors.phone = 'Vui lòng nhập số điện thoại của bạn';
        } else if (!/^[0-9+\s-]+$/.test(currentPhone)) {
            errors.phone = 'Số điện thoại chỉ được chứa số, dấu + và dấu gạch ngang';
        } else if (!currentPhone.match(/^(0[1-9][0-9]{8,9}|\+84[1-9][0-9]{7,9})$/)) {
            errors.phone = 'Số điện thoại không hợp lệ. Vui lòng nhập theo định dạng: 0xxxxxxxxx (10-11 số) hoặc +84xxxxxxxxx';
        }
    }

    // Gender validation - only validate if gender is being changed
    const currentGender = (form.gender || '').trim();
    const originalGender = (originalForm?.gender || '').trim();
    const genderChanged = currentGender !== originalGender;
    
    if (genderChanged) {
        if (!currentGender || currentGender.length === 0) {
            errors.gender = 'Vui lòng chọn giới tính (Nam hoặc Nữ)';
        } else {
            const gender = currentGender.toUpperCase();
            if (!(gender === "MALE" || gender === "FEMALE")) {
                errors.gender = 'Giới tính không hợp lệ. Vui lòng chọn "Nam" hoặc "Nữ"';
            }
        }
    }

    // Address validation - only validate if address is being changed
    const currentAddress = (form.address || '').trim();
    const originalAddress = (originalForm?.address || '').trim();
    const addressChanged = currentAddress !== originalAddress;
    
    if (addressChanged) {
        if (!currentAddress || currentAddress.length === 0) {
            errors.address = 'Vui lòng nhập địa chỉ của bạn (số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố)';
        } else if (currentAddress.length < 10) {
            errors.address = `Địa chỉ quá ngắn (${currentAddress.length}/10 ký tự). Vui lòng nhập địa chỉ đầy đủ hơn`;
        } else if (currentAddress.length > 255) {
            errors.address = `Địa chỉ quá dài (${currentAddress.length}/255 ký tự). Vui lòng rút ngắn lại`;
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
