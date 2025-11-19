import {
    Autocomplete,
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    Radio,
    Stack,
    TextField,
    Typography
} from '@mui/material';
import React, {useEffect, useState} from 'react';
import {COLORS, DASHBOARD_STYLES} from '../../constants.js';
import {createShippingAddress, getShippingAddresses} from '../../../services/ShippingAddressService.jsx';
import {viewDistricts, viewProvinces, viewWards} from '../../../services/GhnService.jsx';

const ShippingAddressDialog = ({ open, onClose, onSelect }) => {
    const [addresses, setAddresses] = useState([]);
    const [selectedId, setSelectedId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [mode, setMode] = useState("list");
    
    const [provinces, setProvinces] = useState([]);
    const [selectedProvince, setSelectedProvince] = useState("");
    const [districts, setDistricts] = useState([]);
    const [selectedDistrict, setSelectedDistrict] = useState("");
    const [wards, setWards] = useState([]);
    const [selectedWard, setSelectedWard] = useState("");
    const [shippingAddress, setShippingAddress] = useState("");

    const DEFAULT_SORT = (list, selected) => {
        const sorted = [...list].sort((a, b) => {
            if (a.id === selected) return -1;
            if (b.id === selected) return 1;
            if (a.isDefault === b.isDefault) return 0;
            return a.isDefault ? -1 : 1;
        });
        return sorted;
    };

    const handleSaveAddress = async () => {
        if (!selectedProvince || !selectedDistrict || !selectedWard || !shippingAddress) {
          alert("Vui lòng nhập đầy đủ thông tin!");
          return;
        }

        const payload = {
          shippingAddress,
          shippingProvinceId: selectedProvince,
          shippingDistrictId: selectedDistrict,
          shippingWardCode: selectedWard,
        };

        try {
          await createShippingAddress(payload);
          setMode("list");
          const refresh = await getShippingAddresses();
          const list = refresh?.data?.data || [];
          const sorted = DEFAULT_SORT(list, null);
          setAddresses(sorted);
          setSelectedId(sorted[0]?.id);
        } catch (err) {
          console.error("Create error:", err);
          alert("Không thể lưu địa chỉ!");
        }
    };

    useEffect(() => {
        if (mode === "create") fetchProvinces();
    }, [mode]);

    const fetchProvinces = async () => {
        try {
            const res = await viewProvinces();
            setProvinces(res?.data?.data || []);
        } catch (err) {
            console.error("Error fetching provinces:", err);
        }
    };

    useEffect(() => {
        if (!open) return;

        setMode("list");
        const loadAddresses = async () => {
            setLoading(true);
            try {
                const res = await getShippingAddresses();
                const list = res?.data?.data || [];

                const sorted = DEFAULT_SORT(list, selectedId);
                setAddresses(sorted);

                const def = sorted.find(a => a.isDefault);
                setSelectedId(prev => prev || def?.id || sorted[0]?.id);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        loadAddresses();
    }, [open]);

    const handleApply = () => {
        const picked = addresses.find(a => a.id === selectedId);
        const reordered = DEFAULT_SORT(addresses, selectedId);
        setAddresses(reordered);

        if (onSelect) onSelect(picked);
        if (onClose) onClose();
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth
            slotProps={{ paper: { sx: DASHBOARD_STYLES.dialog } }}>
            
            <DialogTitle sx={DASHBOARD_STYLES.dialogTitle}>
                Địa Chỉ Nhận Hàng
            </DialogTitle>

            <DialogContent sx={{...DASHBOARD_STYLES.dialogContent}}>
            <Box sx={{...DASHBOARD_STYLES.formSection, mt:2}}>
                <Typography variant="h6" sx={DASHBOARD_STYLES.sectionTitle}>
                    {mode === "list" ? "Danh sách địa chỉ" : "Tạo địa chỉ mới"}
                </Typography>
                <Divider sx={{mb:2}}/>

                {loading ? (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                        <Typography sx={{ color: COLORS.primaryLight }}>
                            Đang tải địa chỉ...
                        </Typography>
                    </Box>
                ) : mode === "create" ? (
                    <>
                       <Box
  sx={{
    display: "grid",
    gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "1fr 1fr" },
    gap: 2,
    width: "100%"
  }}
>
                        <Autocomplete sx={{ flex: 1 }}
                          disablePortal
                          options={provinces}
                          isOptionEqualToValue={(o, v) => o.ProvinceID === v.ProvinceID}
                          getOptionLabel={(o) => o?.ProvinceName ?? ""}
                          renderInput={(params) => <TextField {...params} label="Tỉnh/Thành phố" />}
                          onChange={async (_, val) => {
                            const pId = val?.ProvinceID || "";
                            setSelectedProvince(pId);
                            setSelectedDistrict("");
                            setSelectedWard("");
                            if (pId) {
                              const res = await viewDistricts(pId);
                              setDistricts(res?.data?.data || []);
                            } else {
                              setDistricts([]); setWards([]);
                            }
                          }}
                        />

                        {/* District */}
                        <Autocomplete sx={{ flex: 1 }}
                          disablePortal disabled={!selectedProvince}
                          options={districts}
                          getOptionLabel={(o) => o?.DistrictName ?? ""}
                          renderInput={(params) => <TextField {...params} label="Quận/Huyện" />}
                          onChange={async (_, val) => {
                            const id = val?.DistrictID || "";
                            setSelectedDistrict(id);
                            setSelectedWard("");
                            if (id) {
                              const res = await viewWards(id);
                              setWards(res?.data?.data || []);
                            } else setWards([]);
                          }}
                        />

                        {/* Ward */}
                        <Autocomplete disablePortal disabled={!selectedDistrict}
                          options={wards}
                          getOptionLabel={(o) => o?.WardName ?? ""}
                          renderInput={(params) => <TextField {...params} label="Phường/Xã" />}
                          onChange={(_, val) => setSelectedWard(val?.WardCode || "")}
                        />

                        <TextField fullWidth label="Địa chỉ chi tiết"
                          sx={{ mt:2 }} value={shippingAddress}
                          onChange={(e)=>setShippingAddress(e.target.value)} />
                    </Box>
                    </>
                ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        {addresses.map(addr => {
                        const selected = selectedId === addr.id;
                        return (
                            <Box key={addr.id}
                                onClick={() => setSelectedId(addr.id)}
                                sx={{
                                    p:2, borderRadius:2,
                                    border: selected ? `2px solid ${COLORS.primary}` : '1px solid #ddd',
                                    backgroundColor: selected ? `${COLORS.primary}10` : 'white',
                                    cursor:'pointer'
                                }}>
                                <Stack direction="row" alignItems="flex-start" gap={1}>
                                    <Radio checked={selected}
                                      sx={{ color: COLORS.primary,
                                        '&.Mui-checked':{color:COLORS.primary} }} />

                                    <Box sx={{ flex:1 }}>
                                        <Typography fontWeight={600} sx={{ color: COLORS.primary }}>
                                            {addr.shippingAddress}
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: COLORS.primaryLight }}>
                                            {addr.address}
                                        </Typography>
                                        {addr.isDefault && (
                                            <Typography variant="caption"
                                              sx={{ px:1, py:0.2, background:COLORS.success, color:'white', borderRadius:1 }}>
                                                Mặc định
                                            </Typography>
                                        )}
                                    </Box>
                                </Stack>
                            </Box>
                        )})}
                    </Box>
                )}
            </Box>
            </DialogContent>

            <DialogActions sx={{ p:4, backgroundColor:'#eff5ef' }}>
                <Button onClick={onClose} sx={{ ...DASHBOARD_STYLES.primaryButton, color:'white' }}>
                    Hủy
                </Button>

                {mode === "list" ? (
                    <Stack direction="row" gap={2}>
                        <Button sx={{ ...DASHBOARD_STYLES.primaryButton, color:'white' }}
                            onClick={()=>setMode("create")}>+ Thêm địa chỉ</Button>

                        <Button onClick={handleApply}
                            disabled={!selectedId}
                            sx={{ ...DASHBOARD_STYLES.primaryButton, color:'white' }}>
                            Sử dụng địa chỉ này
                        </Button>
                    </Stack>
                ) : (
                    <Stack direction="row" gap={2}>
                        <Button sx={{ ...DASHBOARD_STYLES.primaryButton, color:'white' }}
                            onClick={()=>setMode("list")}>← Quay lại</Button>

                        <Button sx={{ ...DASHBOARD_STYLES.primaryButton, color:'white' }}
                            onClick={handleSaveAddress}>Lưu địa chỉ</Button>
                    </Stack>
                )}
            </DialogActions>
        </Dialog>
    );
};

export default ShippingAddressDialog;
