export const FENGSHUI = [
    {value: 'KIM', label: 'Kim', color: '#fbbf24'},
    {value: 'MOC', label: 'Mộc', color: '#22c55e'},
    {value: 'THUY', label: 'Thủy', color: '#3b82f6'},
    {value: 'HOA', label: 'Hỏa', color: '#ef4444'},
    {value: 'THO', label: 'Thổ', color: '#a3a3a3'}
]

export const ZODIACS = [
    {value: 'BACH_DUONG', label: 'Bạch Dương', icon: '♈'},
    {value: 'KIM_NGUU', label: 'Kim Ngưu', icon: '♉'},
    {value: 'SONG_TU', label: 'Song Tử', icon: '♊'},
    {value: 'CU_GIAI', label: 'Cự Giải', icon: '♋'},
    {value: 'SU_TU', label: 'Sư Tử', icon: '♌'},
    {value: 'XU_NU', label: 'Xử Nữ', icon: '♍'},
    {value: 'THIEN_BINH', label: 'Thiên Bình', icon: '♎'},
    {value: 'BO_CAP', label: 'Bọ Cạp', icon: '♏'},
    {value: 'NHAN_MA', label: 'Nhân Mã', icon: '♐'},
    {value: 'MA_KET', label: 'Ma Kết', icon: '♑'},
    {value: 'BAO_BINH', label: 'Bảo Bình', icon: '♒'},
    {value: 'SONG_NGU', label: 'Song Ngư', icon: '♓'}
]

export const GENDERS = [
    {value: 'MALE', label: 'Nam', icon: '👨'},
    {value: 'FEMALE', label: 'Nữ', icon: '👩'}
]

export const COLORS = {
    primary: '#0b3f31',
    primaryLight: '#1a6b4e',
    primaryDark: '#073026',
    secondary: '#2c7a5e',
    accent: '#4ade80',
    surface: '#ffffff',
    surfaceVariant: '#f8fffe',
    success: '#22c55e',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
    gradient: {
        primary: 'linear-gradient(135deg, #0b3f31 0%, #1a6b4e 50%, #2c7a5e 100%)',
        secondary: 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)',
        surface: 'linear-gradient(135deg, #ffffff 0%, #f8fffe 100%)',
        card: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(248,255,254,0.8) 100%)',
    }
};

export const FONT_SIZES = {
    xs: '0.75rem',      // 12px
    sm: '0.875rem',     // 14px
    base: '1rem',       // 16px
    lg: '1.125rem',     // 18px
    xl: '1.25rem',      // 20px
    '2xl': '1.5rem',    // 24px
    '3xl': '1.875rem',  // 30px
    '4xl': '2.25rem',   // 36px
    '5xl': '3rem',      // 48px
    '6xl': '3.75rem',   // 60px
    '7xl': '4.5rem',    // 72px
    '8xl': '6rem',      // 96px
    '9xl': '8rem'       // 128px
};

export const FONT_WEIGHTS = {
    thin: '100',
    extralight: '200',
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
    black: '900'
};

export const LINE_HEIGHTS = {
    none: '1',
    tight: '1.25',
    snug: '1.375',
    normal: '1.5',
    relaxed: '1.625',
    loose: '2'
};

export const LETTER_SPACING = {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0em',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em'
};

export const HEADER_STYLES = {
    // Header container styles
    container: {
        position: 'sticky',
        top: 0,
        background: 'linear-gradient(180deg, rgba(255,255,255,.95), rgba(255,255,255,.86))',
        backdropFilter: 'saturate(180%) blur(12px)',
        borderBottom: '1px solid #e0e0e0',
        zIndex: 50,
        boxShadow: '0 8px 24px rgba(11,63,49,.06)'
    },
    
    // Brand/Logo styles
    brand: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem',
        textDecoration: 'none',
        color: 'inherit'
    },
    
    brandLogo: {
        width: '4vw',
        height: '7vh',
        display: 'grid',
        placeItems: 'center',
        background: '#fff',
        border: '1px solid rgba(13, 59, 46, 0.25)',
        borderRadius: '5rem',
        overflow: 'hidden'
    },
    
    brandName: {
        fontFamily: "'Montserrat', 'Segoe UI', Arial, sans-serif",
        fontWeight: 800,
        fontSize: '1.1rem',
        letterSpacing: '0.18em',
        textTransform: 'uppercase',
        color: '#0D3B2E',
        textShadow: '0 4px 16px rgba(30, 111, 87, 0.18), 0 2px 4px #fff, 0 1px 0 #fff',
        background: 'linear-gradient(90deg, #eaffea 60%, transparent 100%)',
        padding: '0.15em 0.6em',
        borderRadius: '0.5em',
        transition: 'color 0.2s, text-shadow 0.2s, background 0.2s'
    },
    
    // Navigation styles
    mainNav: {
        display: 'flex',
        alignItems: 'center',
        gap: '2rem',
        flexWrap: 'nowrap'
    },
    
    navLink: {
        position: 'relative',
        color: '#666',
        textDecoration: 'none',
        fontWeight: 600,
        letterSpacing: '0.01em',
        lineHeight: 1,
        whiteSpace: 'nowrap',
        padding: '0.4rem 0',
        transition: 'color 0.2s ease, transform 0.15s ease'
    },
    
    navLinkHover: {
        color: '#0D3B2E',
        transform: 'translateY(-1px)'
    },
    
    // Search bar styles
    searchbar: {
        display: 'flex',
        alignItems: 'center',
        background: '#fff',
        border: '1px solid #e0e0e0',
        borderRadius: '999px',
        padding: '0 0.85rem',
        height: '40px',
        minWidth: '280px',
        boxShadow: '0 2px 10px rgba(0,0,0,.04)'
    },
    
    searchbarInput: {
        border: 'none',
        outline: 'none',
        width: '100%'
    },
    
    // Header icons styles
    headerIcon: {
        width: '44px',
        height: '44px',
        display: 'grid',
        placeItems: 'center',
        border: '1px solid rgba(0, 0, 0, 0.12)',
        borderRadius: '50%',
        background: '#fff',
        transition: 'all 0.2s ease',
        padding: '0 !important',
        margin: '0 !important',
        cursor: 'pointer'
    },
    
    headerIconHover: {
        transform: 'translateY(-1px)',
        boxShadow: '0 6px 18px rgba(2,6,23,.08)',
        borderColor: 'rgba(13, 59, 46, 0.3)'
    },
    
    // Icon styles
    iconStyle: {
        width: '22px',
        height: '22px',
        color: '#0D3B2E',
        transition: 'all 0.2s ease'
    },
    
    iconHoverStyle: {
        color: '#1a5f4a',
        transform: 'scale(1.1)'
    },
    
    // Avatar styles
    avatar: {
        width: 44,
        height: 44,
        borderRadius: '50%',
        border: '1px solid #e0e0e0',
        backgroundColor: '#fff'
    },
    
    // Dropdown menu styles
    dropdownMenu: {
        marginTop: '8px',
        marginLeft: '-20px',
        background: '#ffffff',
        border: '1px solid rgba(13, 59, 46, 0.1)',
        borderRadius: '20px',
        boxShadow: `
            0 25px 50px -12px rgba(13, 59, 46, 0.25),
            0 12px 24px -6px rgba(13, 59, 46, 0.15),
            0 4px 8px -2px rgba(13, 59, 46, 0.1),
            inset 0 1px 0 rgba(255, 255, 255, 0.9)
        `,
        minWidth: '300px',
        maxWidth: '350px',
        overflow: 'hidden',
        position: 'relative',
        backdropFilter: 'blur(20px)'
    },
    
    menuItem: {
        padding: '16px 24px',
        margin: 0,
        borderRadius: 0,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        overflow: 'hidden',
        borderLeft: '4px solid transparent',
        background: 'rgba(255, 255, 255, 0.02)'
    },
    
    menuItemHover: {
        background: 'linear-gradient(90deg, rgba(13, 59, 46, 0.12) 0%, rgba(26, 95, 74, 0.08) 100%)',
        transform: 'translateX(8px)',
        borderLeftColor: '#0D3B2E',
        boxShadow: 'inset 4px 0 0 rgba(13, 59, 46, 0.2)',
        backdropFilter: 'blur(10px)'
    },
    
    // Responsive breakpoints
    breakpoints: {
        mobile: '768px',
        tablet: '1024px',
        desktop: '1200px'
    }
};

export const DASHBOARD_STYLES = {
    // Main container styles
    container: {
        maxWidth: 'xl',
        py: { xs: 3, sm: 5 }
    },
    
    // Paper/Card container styles
    paper: {
        p: { xs: 2.5, sm: 4, md: 5 },
        borderRadius: 4,
        background: 'linear-gradient(120deg, #f8f9e9 0%, #e0f7fa 100%)',
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.08)',
        border: '1px solid rgba(255, 255, 255, 0.7)'
    },
    
    // Header section styles
    headerSection: {
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: { xs: 'flex-start', sm: 'center' },
        justifyContent: 'space-between',
        gap: 2,
        mb: 3
    },
    
    // Title section with icon
    titleSection: {
        display: 'flex',
        alignItems: 'center'
    },
    
    // Main title styles (giống "Quản Lý Sản Phẩm Sen Đá")
    mainTitle: {
        fontWeight: 900,
        color: '#0b3f31', // Màu xanh đậm giống succulents
        fontSize: '2.25rem', // 4xl size
        lineHeight: 1.2,
        letterSpacing: '-0.02em'
    },
    
    // Subtitle styles
    subtitle: {
        color: '#666',
        fontSize: '0.875rem', // sm size
        fontWeight: 400,
        mt: 0.5
    },
    
    // Icon styles for title
    titleIcon: {
        fontSize: { xs: 38, sm: 44 },
        color: '#0b3f31', // Màu xanh đậm
        mr: 2
    },
    
    // Action section styles (filter + button)
    actionSection: {
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        p: 1.5,
        backgroundColor: 'rgba(255,255,255,0.9)',
        borderRadius: 2,
        boxShadow: '0 2px 10px rgba(0,0,0,0.06)'
    },
    
    // Filter/Select styles
    filterSelect: {
        minWidth: 240,
        '& .MuiOutlinedInput-root': {
            borderRadius: 2,
            backgroundColor: 'white',
            '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: '#0b3f31',
                borderWidth: 2
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: '#0b3f31',
                borderWidth: 2
            }
        },
        '& .MuiInputLabel-root': {
            fontWeight: 600
        }
    },
    
    // Primary action button styles
    primaryButton: {
        borderRadius: 2,
        fontWeight: 700,
        py: 1.2,
        px: 3,
        background: 'linear-gradient(90deg, #0b3f31 0%, #1a6b4e 100%)',
        boxShadow: '0 4px 12px rgba(11, 63, 49, 0.3)',
        '&:hover': {
            background: 'linear-gradient(90deg, #073026 0%, #0b3f31 100%)',
            boxShadow: '0 6px 16px rgba(11, 63, 49, 0.4)',
            transform: 'translateY(-1px)'
        }
    },
    
    // Table styles
    table: {
        headerBgColor: '#0b3f31',
        headerTextColor: 'white',
        hoverColor: '#f8f9fa',
        borderColor: '#e0e0e0',
        stickyHeader: false,
        size: 'medium'
    },
    
    // Status chip styles
    statusChip: {
        fontWeight: 600,
        '&.success': {
            backgroundColor: '#22c55e',
            color: 'white'
        },
        '&.error': {
            backgroundColor: '#ef4444',
            color: 'white'
        }
    },
    
    // Category chip styles
    categoryChip: {
        fontWeight: 800,
        letterSpacing: 0.3,
        '&.pots': {
            color: '#0b3f31',
            borderColor: '#0b3f31'
        },
        '&.soils': {
            color: '#f59e0b',
            borderColor: '#f59e0b'
        },
        '&.decorations': {
            color: '#3b82f6',
            borderColor: '#3b82f6'
        }
    },
    
    // Dialog styles
    dialog: {
        borderRadius: 8,
        boxShadow: '0 24px 38px 3px rgba(0,0,0,0.14), 0 9px 46px 8px rgba(0,0,0,0.12), 0 11px 15px -7px rgba(0,0,0,0.2)',
        overflow: 'hidden'
    },
    
    // Dialog title styles
    dialogTitle: {
        background: 'linear-gradient(90deg, #0b3f31 0%, #1a6b4e 100%)',
        color: 'white',
        fontSize: '1.5rem',
        fontWeight: 600,
        py: 3,
        textAlign: 'center'
    },
    
    // Dialog content styles
    dialogContent: {
        p: 4,
        backgroundColor: '#f7faf7'
    },
    
    // Form section styles
    formSection: {
        p: 3,
        mb: 3,
        borderRadius: 2,
        backgroundColor: 'white',
        boxShadow: '0 2px 10px rgba(0,0,0,0.06)'
    },
    
    // Form field styles
    formField: {
        '& .MuiOutlinedInput-root': {
            borderRadius: 2,
            backgroundColor: 'white',
            '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: '#0b3f31',
                borderWidth: 2
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: '#0b3f31',
                borderWidth: 2
            }
        },
        '& .MuiInputLabel-root': {
            fontWeight: 500,
            color: '#424242'
        }
    },
    
    // Section title styles
    sectionTitle: {
        fontWeight: 600,
        color: '#0b3f31',
        mb: 1
    }
};