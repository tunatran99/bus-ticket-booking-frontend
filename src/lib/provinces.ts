export type ProvinceGroup = {
  id: 'north' | 'central' | 'south';
  provinces: string[];
};

const northernProvinces: string[] = [
  'Hà Nội',
  'Hải Phòng',
  'Bắc Giang',
  'Bắc Kạn',
  'Bắc Ninh',
  'Cao Bằng',
  'Điện Biên',
  'Hà Giang',
  'Hà Nam',
  'Hải Dương',
  'Hòa Bình',
  'Hưng Yên',
  'Lai Châu',
  'Lạng Sơn',
  'Lào Cai',
  'Nam Định',
  'Ninh Bình',
  'Phú Thọ',
  'Quảng Ninh',
  'Sơn La',
  'Thái Bình',
  'Thái Nguyên',
  'Tuyên Quang',
  'Vĩnh Phúc',
  'Yên Bái',
];

const centralProvinces: string[] = [
  'Thanh Hóa',
  'Nghệ An',
  'Hà Tĩnh',
  'Quảng Bình',
  'Quảng Trị',
  'Thừa Thiên Huế',
  'Đà Nẵng',
  'Quảng Nam',
  'Quảng Ngãi',
  'Bình Định',
  'Phú Yên',
  'Khánh Hòa',
  'Ninh Thuận',
  'Bình Thuận',
  'Kon Tum',
  'Gia Lai',
  'Đắk Lắk',
  'Đắk Nông',
  'Lâm Đồng',
];

const southernProvinces: string[] = [
  'Hồ Chí Minh',
  'Cần Thơ',
  'An Giang',
  'Bà Rịa - Vũng Tàu',
  'Bạc Liêu',
  'Bến Tre',
  'Bình Dương',
  'Bình Phước',
  'Cà Mau',
  'Đồng Nai',
  'Đồng Tháp',
  'Hậu Giang',
  'Kiên Giang',
  'Long An',
  'Sóc Trăng',
  'Tây Ninh',
  'Tiền Giang',
  'Trà Vinh',
  'Vĩnh Long',
];

export const provinceGroups: ProvinceGroup[] = [
  { id: 'north', provinces: northernProvinces },
  { id: 'central', provinces: centralProvinces },
  { id: 'south', provinces: southernProvinces },
];

export const vietnamProvinces = provinceGroups.flatMap((group) => group.provinces);

export const hubProvinces = ['Hà Nội', 'Hồ Chí Minh', 'Đà Nẵng', 'Khánh Hòa', 'Cần Thơ'];
