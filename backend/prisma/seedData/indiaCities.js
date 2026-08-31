// Extensive (not exhaustive) list of major cities/towns per Indian
// State/UT — district headquarters, major towns, and well-known cities.
// Keyed by exact State.name as seeded in prisma/seed.js — must match
// exactly or a state's cities will silently fail to attach (seed.js logs
// a warning if a key here has no matching State row).

module.exports = {
  'Andhra Pradesh': [
    'Visakhapatnam', 'Vijayawada', 'Guntur', 'Nellore', 'Kurnool', 'Rajahmundry', 'Tirupati',
    'Kakinada', 'Kadapa', 'Anantapur', 'Vizianagaram', 'Eluru', 'Ongole', 'Nandyal',
    'Machilipatnam', 'Adoni', 'Tenali', 'Proddatur', 'Chittoor', 'Hindupur', 'Srikakulam',
    'Bhimavaram', 'Madanapalle', 'Guntakal', 'Dharmavaram', 'Gudivada', 'Narasaraopet',
    'Tadepalligudem', 'Chilakaluripet', 'Amaravati', 'Tadipatri', 'Rajampet',
  ],
  'Arunachal Pradesh': [
    'Itanagar', 'Naharlagun', 'Pasighat', 'Tawang', 'Ziro', 'Bomdila', 'Aalo', 'Tezu',
    'Changlang', 'Khonsa', 'Roing', 'Yingkiong', 'Seppa', 'Along',
  ],
  'Assam': [
    'Guwahati', 'Silchar', 'Dibrugarh', 'Jorhat', 'Nagaon', 'Tinsukia', 'Tezpur', 'Bongaigaon',
    'Karimganj', 'Sivasagar', 'Goalpara', 'Barpeta', 'Dhubri', 'North Lakhimpur', 'Diphu',
    'Golaghat', 'Hailakandi', 'Kokrajhar', 'Mangaldoi', 'Nalbari', 'Rangia', 'Marigaon',
  ],
  'Bihar': [
    'Patna', 'Gaya', 'Bhagalpur', 'Muzaffarpur', 'Purnia', 'Darbhanga', 'Bihar Sharif', 'Arrah',
    'Begusarai', 'Katihar', 'Munger', 'Chhapra', 'Danapur', 'Saharsa', 'Sasaram', 'Hajipur',
    'Dehri', 'Siwan', 'Motihari', 'Nawada', 'Bagaha', 'Buxar', 'Kishanganj', 'Sitamarhi',
    'Jamalpur', 'Jehanabad', 'Aurangabad', 'Gopalganj', 'Madhubani', 'Samastipur', 'Bettiah',
    'Khagaria', 'Araria', 'Lakhisarai', 'Sheikhpura', 'Supaul',
  ],
  'Chhattisgarh': [
    'Raipur', 'Bhilai', 'Bilaspur', 'Korba', 'Durg', 'Rajnandgaon', 'Jagdalpur', 'Raigarh',
    'Ambikapur', 'Mahasamund', 'Dhamtari', 'Chirmiri', 'Janjgir', 'Kanker', 'Kawardha',
    'Kondagaon', 'Bhatapara', 'Dongargarh',
  ],
  'Goa': [
    'Panaji', 'Margao', 'Vasco da Gama', 'Mapusa', 'Ponda', 'Bicholim', 'Curchorem',
    'Sanquelim', 'Cuncolim', 'Canacona', 'Valpoi',
  ],
  'Gujarat': [
    'Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar', 'Jamnagar', 'Junagadh',
    'Gandhinagar', 'Anand', 'Navsari', 'Morbi', 'Nadiad', 'Surendranagar', 'Bharuch',
    'Mehsana', 'Bhuj', 'Porbandar', 'Palanpur', 'Valsad', 'Vapi', 'Godhra', 'Patan',
    'Veraval', 'Gandhidham', 'Botad', 'Amreli', 'Deesa', 'Dahod', 'Jetpur', 'Modasa',
  ],
  'Haryana': [
    'Faridabad', 'Gurugram', 'Panipat', 'Ambala', 'Yamunanagar', 'Rohtak', 'Hisar', 'Karnal',
    'Sonipat', 'Panchkula', 'Bhiwani', 'Sirsa', 'Bahadurgarh', 'Jind', 'Thanesar', 'Kaithal',
    'Rewari', 'Palwal', 'Kurukshetra', 'Fatehabad', 'Gohana', 'Narnaul', 'Charkhi Dadri',
  ],
  'Himachal Pradesh': [
    'Shimla', 'Dharamshala', 'Solan', 'Mandi', 'Palampur', 'Baddi', 'Nahan', 'Una', 'Kullu',
    'Hamirpur', 'Bilaspur', 'Chamba', 'Kangra', 'Manali', 'Sundarnagar', 'Parwanoo',
  ],
  'Jharkhand': [
    'Ranchi', 'Jamshedpur', 'Dhanbad', 'Bokaro', 'Deoghar', 'Hazaribagh', 'Giridih', 'Ramgarh',
    'Medininagar', 'Chirkunda', 'Phusro', 'Dumka', 'Chaibasa', 'Godda', 'Sahibganj', 'Gumla',
    'Chatra', 'Jamtara',
  ],
  'Karnataka': [
    'Bengaluru', 'Mysuru', 'Hubballi', 'Mangaluru', 'Belagavi', 'Kalaburagi', 'Davanagere',
    'Ballari', 'Vijayapura', 'Shivamogga', 'Tumakuru', 'Raichur', 'Bidar', 'Hospet', 'Hassan',
    'Gadag', 'Udupi', 'Chitradurga', 'Kolar', 'Mandya', 'Chikkamagaluru', 'Bagalkot',
    'Ranebennuru', 'Robertsonpet', 'Bhadravati', 'Gangavati', 'Yadgir', 'Sirsi',
  ],
  'Kerala': [
    'Thiruvananthapuram', 'Kochi', 'Kozhikode', 'Thrissur', 'Kollam', 'Palakkad', 'Alappuzha',
    'Kannur', 'Kottayam', 'Malappuram', 'Kasaragod', 'Pathanamthitta', 'Idukki', 'Wayanad',
    'Manjeri', 'Thalassery', 'Ponnani', 'Vatakara', 'Neyyattinkara', 'Kayamkulam', 'Guruvayur',
    'Payyanur', 'Perinthalmanna',
  ],
  'Madhya Pradesh': [
    'Indore', 'Bhopal', 'Jabalpur', 'Gwalior', 'Ujjain', 'Sagar', 'Dewas', 'Satna', 'Ratlam',
    'Rewa', 'Katni', 'Singrauli', 'Burhanpur', 'Khandwa', 'Bhind', 'Chhindwara', 'Guna',
    'Shivpuri', 'Vidisha', 'Chhatarpur', 'Damoh', 'Mandsaur', 'Khargone', 'Neemuch',
    'Pithampur', 'Hoshangabad', 'Itarsi', 'Sehore', 'Betul', 'Seoni', 'Balaghat', 'Morena',
    'Dhar', 'Mandla',
  ],
  'Maharashtra': [
    'Mumbai', 'Pune', 'Nagpur', 'Nashik', 'Thane', 'Chhatrapati Sambhajinagar', 'Solapur',
    'Amravati', 'Kolhapur', 'Sangli', 'Malegaon', 'Jalgaon', 'Akola', 'Latur', 'Dhule',
    'Ahmednagar', 'Chandrapur', 'Parbhani', 'Ichalkaranji', 'Jalna', 'Bhusawal', 'Panvel',
    'Satara', 'Beed', 'Yavatmal', 'Kamptee', 'Gondia', 'Barshi', 'Achalpur', 'Osmanabad',
    'Nanded', 'Wardha', 'Ratnagiri', 'Navi Mumbai', 'Vasai-Virar', 'Kalyan-Dombivli',
    'Pimpri-Chinchwad', 'Ulhasnagar', 'Bhiwandi', 'Miraj', 'Karad',
  ],
  'Manipur': [
    'Imphal', 'Thoubal', 'Bishnupur', 'Churachandpur', 'Kakching', 'Senapati', 'Ukhrul',
    'Tamenglong', 'Jiribam', 'Moirang',
  ],
  'Meghalaya': [
    'Shillong', 'Tura', 'Jowai', 'Nongstoin', 'Baghmara', 'Williamnagar', 'Nongpoh',
    'Mairang',
  ],
  'Mizoram': [
    'Aizawl', 'Lunglei', 'Champhai', 'Serchhip', 'Kolasib', 'Saiha', 'Lawngtlai', 'Mamit',
  ],
  'Nagaland': [
    'Kohima', 'Dimapur', 'Mokokchung', 'Tuensang', 'Wokha', 'Zunheboto', 'Phek', 'Mon',
    'Kiphire', 'Peren',
  ],
  'Odisha': [
    'Bhubaneswar', 'Cuttack', 'Rourkela', 'Berhampur', 'Sambalpur', 'Puri', 'Balasore',
    'Bhadrak', 'Baripada', 'Jharsuguda', 'Jeypore', 'Bargarh', 'Rayagada', 'Kendrapara',
    'Dhenkanal', 'Angul', 'Koraput', 'Paradip', 'Talcher', 'Bhawanipatna', 'Sunabeda',
  ],
  'Punjab': [
    'Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala', 'Bathinda', 'Mohali', 'Hoshiarpur',
    'Batala', 'Pathankot', 'Moga', 'Abohar', 'Malerkotla', 'Khanna', 'Phagwara', 'Muktsar',
    'Barnala', 'Rajpura', 'Firozpur', 'Kapurthala', 'Faridkot', 'Sangrur', 'Gurdaspur',
    'Zirakpur', 'Mansa',
  ],
  'Rajasthan': [
    'Jaipur', 'Jodhpur', 'Udaipur', 'Kota', 'Bikaner', 'Ajmer', 'Bhilwara', 'Alwar',
    'Bharatpur', 'Sikar', 'Pali', 'Sri Ganganagar', 'Kishangarh', 'Baran', 'Dhaulpur', 'Tonk',
    'Beawar', 'Hanumangarh', 'Churu', 'Jhunjhunu', 'Nagaur', 'Barmer', 'Chittorgarh',
    'Banswara', 'Dausa', 'Sawai Madhopur', 'Jaisalmer', 'Sirohi', 'Bundi', 'Jhalawar',
  ],
  'Sikkim': [
    'Gangtok', 'Namchi', 'Gyalshing', 'Mangan', 'Rangpo', 'Jorethang', 'Singtam',
  ],
  'Tamil Nadu': [
    'Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem', 'Tirunelveli', 'Erode',
    'Vellore', 'Thoothukudi', 'Dindigul', 'Thanjavur', 'Tiruppur', 'Ranipet', 'Nagercoil',
    'Kanchipuram', 'Kumbakonam', 'Karur', 'Hosur', 'Cuddalore', 'Sivakasi', 'Namakkal',
    'Pollachi', 'Rajapalayam', 'Ambur', 'Nagapattinam', 'Pudukkottai', 'Udhagamandalam',
    'Krishnagiri', 'Theni', 'Virudhunagar', 'Tiruvannamalai', 'Nagapattinam', 'Cuddalore',
  ],
  'Telangana': [
    'Hyderabad', 'Warangal', 'Nizamabad', 'Karimnagar', 'Khammam', 'Ramagundam',
    'Mahbubnagar', 'Nalgonda', 'Adilabad', 'Suryapet', 'Miryalaguda', 'Siddipet', 'Jagtial',
    'Sangareddy', 'Medak', 'Bhongir', 'Mancherial', 'Kamareddy', 'Wanaparthy', 'Kothagudem',
  ],
  'Tripura': [
    'Agartala', 'Udaipur', 'Dharmanagar', 'Kailashahar', 'Belonia', 'Khowai', 'Ambassa',
    'Sabroom', 'Sonamura', 'Teliamura',
  ],
  'Uttar Pradesh': [
    'Lucknow', 'Kanpur', 'Ghaziabad', 'Agra', 'Meerut', 'Varanasi', 'Prayagraj', 'Bareilly',
    'Aligarh', 'Moradabad', 'Saharanpur', 'Gorakhpur', 'Noida', 'Firozabad', 'Jhansi',
    'Muzaffarnagar', 'Mathura', 'Rampur', 'Shahjahanpur', 'Farrukhabad', 'Ayodhya',
    'Maunath Bhanjan', 'Hapur', 'Etawah', 'Mirzapur', 'Bulandshahr', 'Sambhal', 'Amroha',
    'Hardoi', 'Fatehpur', 'Raebareli', 'Orai', 'Sitapur', 'Bahraich', 'Modinagar', 'Unnao',
    'Jaunpur', 'Ghazipur', 'Deoria', 'Azamgarh', 'Basti', 'Greater Noida', 'Lakhimpur',
    'Pilibhit', 'Banda', 'Barabanki',
  ],
  'Uttarakhand': [
    'Dehradun', 'Haridwar', 'Roorkee', 'Haldwani', 'Rudrapur', 'Kashipur', 'Rishikesh',
    'Nainital', 'Almora', 'Pithoragarh', 'Kotdwar', 'Ramnagar', 'Mussoorie', 'Pauri',
    'Rudraprayag', 'Champawat',
  ],
  'West Bengal': [
    'Kolkata', 'Asansol', 'Siliguri', 'Durgapur', 'Bardhaman', 'Malda', 'Baharampur', 'Habra',
    'Kharagpur', 'Shantipur', 'Dankuni', 'Dhulian', 'Ranaghat', 'Haldia', 'Raiganj',
    'Krishnanagar', 'Nabadwip', 'Medinipur', 'Jalpaiguri', 'Balurghat', 'Basirhat', 'Bankura',
    'Chakdaha', 'Darjeeling', 'Alipurduar', 'Purulia', 'Jangipur', 'Bolpur', 'Cooch Behar',
    'Howrah', 'Barrackpore', 'Serampore',
  ],
  'Andaman and Nicobar Islands': [
    'Port Blair', 'Diglipur', 'Rangat', 'Mayabunder', 'Car Nicobar',
  ],
  'Chandigarh': [
    'Chandigarh',
  ],
  'Dadra and Nagar Haveli and Daman and Diu': [
    'Silvassa', 'Daman', 'Diu',
  ],
  'Delhi': [
    'New Delhi', 'Dwarka', 'Rohini', 'Karol Bagh', 'Saket', 'Pitampura', 'Janakpuri',
    'Lajpat Nagar', 'Connaught Place', 'Vasant Kunj', 'Shahdara', 'Najafgarh',
  ],
  'Jammu and Kashmir': [
    'Srinagar', 'Jammu', 'Anantnag', 'Baramulla', 'Sopore', 'Udhampur', 'Kathua', 'Rajouri',
    'Poonch', 'Kupwara', 'Pulwama', 'Kulgam', 'Budgam', 'Ganderbal', 'Bandipora', 'Doda',
    'Kishtwar', 'Ramban', 'Reasi', 'Samba',
  ],
  'Ladakh': [
    'Leh', 'Kargil',
  ],
  'Lakshadweep': [
    'Kavaratti', 'Agatti', 'Minicoy', 'Andrott',
  ],
  'Puducherry': [
    'Puducherry', 'Karaikal', 'Yanam', 'Mahe',
  ],
};