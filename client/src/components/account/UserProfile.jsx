import { useEffect, useState } from 'react'
import { Box, Button, Grid, MenuItem, Paper, TextField, Typography } from '@mui/material'
import { enqueueSnackbar } from 'notistack'
import { viewProfile, updateProfile } from '../../services/AccountService.jsx'

const GENDERS = ['MALE', 'FEMALE', 'OTHER']
const FENGSHUI = ['KIM','MOC','THUY','HOA','THO']
const ZODIACS = ['ARIES','TAURUS','GEMINI','CANCER','LEO','VIRGO','LIBRA','SCORPIO','SAGITTARIUS','CAPRICORN','AQUARIUS','PISCES']

export default function UserProfile() {
    const [form, setForm] = useState({
        name: '',
        phone: '',
        gender: '',
        address: '',
        avatarUrl: '',
        fengShui: '',
        zodiac: ''
    })
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        let mounted = true
        async function load() {
            try {
                setLoading(true)
                const res = await viewProfile()
                const data = res?.data?.body || {}
                if (mounted) {
                    setForm({
                        name: data.name || '',
                        phone: data.phone || '',
                        gender: data.gender || '',
                        address: data.address || '',
                        avatarUrl: data.avatarUrl || '',
                        fengShui: data.fengShui || '',
                        zodiac: data.zodiac || ''
                    })
                }
            } catch (e) {
                enqueueSnackbar('Không tải được hồ sơ', { variant: 'error' })
            } finally {
                setLoading(false)
            }
        }
        load()
        return () => { mounted = false }
    }, [])

    function handleChange(field) {
        return (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }))
    }

    async function handleSubmit(e) {
        e.preventDefault()
        try {
            setLoading(true)
            const res = await updateProfile(
                form.name,
                form.phone,
                form.gender,
                form.address,
                form.avatarUrl,
                form.fengShui,
                form.zodiac
            )
            if (res?.status === 200) {
                enqueueSnackbar(res?.data?.message || 'Cập nhật thành công', { variant: 'success' })
            } else {
                enqueueSnackbar('Cập nhật không thành công', { variant: 'warning' })
            }
        } catch (e) {
            enqueueSnackbar('Cập nhật thất bại', { variant: 'error' })
        } finally {
            setLoading(false)
        }
    }

    return (
        <Box sx={{ maxWidth: 900, mx: 'auto', py: 4, px: 2 }}>
            <Typography variant="h5" sx={{ fontWeight: 800, mb: 2 }}>Hồ sơ của tôi</Typography>
            <Paper sx={{ p: 3 }}>
                <form onSubmit={handleSubmit}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                            <TextField label="Họ và tên" fullWidth value={form.name} onChange={handleChange('name')} />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField label="Số điện thoại" fullWidth value={form.phone} onChange={handleChange('phone')} />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField select label="Giới tính" fullWidth value={form.gender} onChange={handleChange('gender')}>
                                {GENDERS.map(g => <MenuItem key={g} value={g}>{g}</MenuItem>)}
                            </TextField>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField label="Địa chỉ" fullWidth value={form.address} onChange={handleChange('address')} />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField label="Avatar URL" fullWidth value={form.avatarUrl} onChange={handleChange('avatarUrl')} />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField select label="Ngũ hành (FengShui)" fullWidth value={form.fengShui} onChange={handleChange('fengShui')}>
                                {FENGSHUI.map(f => <MenuItem key={f} value={f}>{f}</MenuItem>)}
                            </TextField>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField select label="Cung hoàng đạo (Zodiac)" fullWidth value={form.zodiac} onChange={handleChange('zodiac')}>
                                {ZODIACS.map(z => <MenuItem key={z} value={z}>{z}</MenuItem>)}
                            </TextField>
                        </Grid>
                        <Grid item xs={12}>
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                                <Button type="submit" variant="contained" disabled={loading}>Lưu thay đổi</Button>
                            </Box>
                        </Grid>
                    </Grid>
                </form>
            </Paper>
        </Box>
    )
}