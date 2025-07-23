import { MigrationInterface, QueryRunner } from "typeorm";
import { v4 as uuidv4 } from 'uuid';

export class PopulateInitialData1753262522470 implements MigrationInterface {
    name = 'PopulateInitialData1753262522470'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // --- Insert Service Categories ---
        const categories = [
            { id: uuidv4(), name: 'Household Services', description: 'Services related to home maintenance and daily chores.', icon_url: 'icon_household.png', sort_order: 10 },
            { id: uuidv4(), name: 'Grocery', description: 'Grocery shopping and delivery services.', icon_url: 'icon_grocery.png', sort_order: 20 },
            { id: uuidv4(), name: 'Food & Beverage', description: 'Restaurant, cafe, and food delivery services.', icon_url: 'icon_food.png', sort_order: 30 },
            { id: uuidv4(), name: 'Transportation', description: 'Taxi, auto, and various transportation services.', icon_url: 'icon_transport.png', sort_order: 40 },
            { id: uuidv4(), name: 'Healthcare', description: 'Medical, pharmacy, and wellness services.', icon_url: 'icon_healthcare.png', sort_order: 50 },
            { id: uuidv4(), name: 'Beauty & Care', description: 'Salon, spa, and grooming services.', icon_url: 'icon_beauty.png', sort_order: 60 },
            { id: uuidv4(), name: 'Education', description: 'Tutoring, training, and skill development services.', icon_url: 'icon_education.png', sort_order: 70 },
            { id: uuidv4(), name: 'Professional', description: 'Consulting, legal, and financial services.', icon_url: 'icon_professional.png', sort_order: 80 },
            { id: uuidv4(), name: 'Entertainment', description: 'Event management, photography, and music services.', icon_url: 'icon_entertainment.png', sort_order: 90 },
        ];

        for (const cat of categories) {
            await queryRunner.query(
                `INSERT INTO "service_categories" (id, name, description, icon_url, is_active, sort_order, created_at, updated_at) VALUES ($1, $2, $3, $4, TRUE, $5, NOW(), NOW())`,
                [cat.id, cat.name, cat.description, cat.icon_url, cat.sort_order]
            );
        }

        // Map category names to their generated IDs for linking service types
        const categoryMap = new Map<string, string>();
        categories.forEach(cat => categoryMap.set(cat.name, cat.id));

        // --- Insert Service Types (linking to categories) ---
        const serviceTypes = [
            // Food & Beverage
            { categoryName: 'Food & Beverage', name: 'Restaurants', description: 'Dining at various restaurants', base_fare_type: 'fixed' },
            { categoryName: 'Food & Beverage', name: 'Cafes', description: 'Coffee shops and cafes', base_fare_type: 'fixed' },
            { categoryName: 'Food & Beverage', name: 'Food Delivery', description: 'Delivery of food from various outlets', base_fare_type: 'fixed' },
            // Transportation
            { categoryName: 'Transportation', name: 'Taxi', description: 'On-demand taxi services', base_fare_type: 'per_km' },
            { categoryName: 'Transportation', name: 'Auto', description: 'Auto-rickshaw services', base_fare_type: 'per_km' },
            { categoryName: 'Transportation', name: 'Courier Delivery', description: 'Parcel and document delivery', base_fare_type: 'fixed' },
            // Healthcare
            { categoryName: 'Healthcare', name: 'Medical Consultation', description: 'Online/offline doctor consultations', base_fare_type: 'fixed' },
            { categoryName: 'Healthcare', name: 'Pharmacy Delivery', description: 'Medicine delivery services', base_fare_type: 'fixed' },
            { categoryName: 'Healthcare', name: 'Wellness Services', description: 'Yoga, meditation, and therapy sessions', base_fare_type: 'hourly' },
            // Beauty & Care
            { categoryName: 'Beauty & Care', name: 'Salon Services', description: 'Haircuts, styling, and beauty treatments', base_fare_type: 'fixed' },
            { categoryName: 'Beauty & Care', name: 'Spa & Massage', description: 'Relaxing spa and massage therapies', base_fare_type: 'hourly' },
            { categoryName: 'Beauty & Care', name: 'Grooming', description: 'Personal grooming services', base_fare_type: 'fixed' },
            // Education
            { categoryName: 'Education', name: 'Tutoring', description: 'Academic tutoring for various subjects', base_fare_type: 'hourly' },
            { categoryName: 'Education', name: 'Skills Training', description: 'Vocational and professional skill development', base_fare_type: 'fixed' },
            { categoryName: 'Education', name: 'Language Classes', description: 'Learning new languages', base_fare_type: 'hourly' },
            // Professional
            { categoryName: 'Professional', name: 'Consulting', description: 'Business and personal consulting services', base_fare_type: 'hourly' },
            { categoryName: 'Professional', name: 'Legal Services', description: 'Legal advice and representation', base_fare_type: 'fixed' },
            { categoryName: 'Professional', name: 'Financial Advisory', description: 'Financial planning and investment advice', base_fare_type: 'fixed' },
            // Entertainment
            { categoryName: 'Entertainment', name: 'Event Management', description: 'Planning and execution of events', base_fare_type: 'fixed' },
            { categoryName: 'Entertainment', name: 'Photography', description: 'Professional photography services', base_fare_type: 'hourly' },
            { categoryName: 'Entertainment', name: 'Music Lessons', description: 'Instrumental and vocal music lessons', base_fare_type: 'hourly' },
        ];

        for (const st of serviceTypes) {
            const categoryId = categoryMap.get(st.categoryName);
            if (categoryId) {
                await queryRunner.query(
                    `INSERT INTO "service_types" (id, category_id, name, description, base_fare_type, is_active, sort_order, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, TRUE, 0, NOW(), NOW())`,
                    [uuidv4(), categoryId, st.name, st.description, st.base_fare_type]
                );
            }
        }

        // --- Insert Countries (India) ---
        const indiaId = uuidv4();
        await queryRunner.query(
            `INSERT INTO "countries" (id, name, iso2, iso3, numeric_code, phone_code, capital, currency, currency_name, currency_symbol, tld, native, region, subregion, timezones, latitude, longitude, emoji, emoji_u, flag, wiki_data_id, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, NOW(), NOW())`,
            [
                indiaId,
                'India', 'IN', 'IND', '356', '91', 'New Delhi', 'INR', 'Indian Rupee', '₹', '.in', 'भारत', 'Asia', 'Southern Asia',
                JSON.stringify([{"zoneName":"Asia/Kolkata","gmtOffset":19800,"gmtOffsetName":"UTC+05:30","abbreviation":"IST","tzName":"Indian Standard Time"}]),
                20.593683, 78.962880, '🇮🇳', 'U+1F1EE U+1F1F3', true, 'Q668'
            ]
        );

        // --- Insert States (of India) from provided JSON ---
        const statesData = [
            { "state": "Andhra Pradesh", "districts": ["Anantapur", "Chittoor", "East Godavari", "Guntur", "Krishna", "Kurnool", "Nellore", "Prakasam", "Srikakulam", "Visakhapatnam", "Vizianagaram", "West Godavari", "YSR Kadapa"] },
            { "state": "Arunachal Pradesh", "districts": ["Tawang", "West Kameng", "East Kameng", "Papum Pare", "Kurung Kumey", "Kra Daadi", "Lower Subansiri", "Upper Subansiri", "West Siang", "East Siang", "Siang", "Upper Siang", "Lower Siang", "Lower Dibang Valley", "Dibang Valley", "Anjaw", "Lohit", "Namsai", "Changlang", "Tirap", "Longding"] },
            { "state": "Assam", "districts": ["Baksa", "Barpeta", "Biswanath", "Bongaigaon", "Cachar", "Charaideo", "Chirang", "Darrang", "Dhemaji", "Dhubri", "Dibrugarh", "Goalpara", "Golaghat", "Hailakandi", "Hojai", "Jorhat", "Kamrup Metropolitan", "Kamrup", "Karbi Anglong", "Karimganj", "Kokrajhar", "Lakhimpur", "Majuli", "Morigaon", "Nagaon", "Nalbari", "Dima Hasao", "Sivasagar", "Sonitpur", "South Salmara-Mankachar", "Tinsukia", "Udalguri", "West Karbi Anglong"] },
            { "state": "Bihar", "districts": ["Araria", "Arwal", "Aurangabad", "Banka", "Begusarai", "Bhagalpur", "Bhojpur", "Buxar", "Darbhanga", "East Champaran (Motihari)", "Gaya", "Gopalganj", "Jamui", "Jehanabad", "Kaimur (Bhabua)", "Katihar", "Khagaria", "Kishanganj", "Lakhisarai", "Madhepura", "Madhubani", "Munger (Monghyr)", "Muzaffarpur", "Nalanda", "Nawada", "Patna", "Purnia (Purnea)", "Rohtas", "Saharsa", "Samastipur", "Saran", "Sheikhpura", "Sheohar", "Sitamarhi", "Siwan", "Supaul", "Vaishali", "West Champaran"] },
            { "state": "Chandigarh (UT)", "districts": ["Chandigarh"] },
            { "state": "Chhattisgarh", "districts": ["Balod", "Baloda Bazar", "Balrampur", "Bastar", "Bemetara", "Bijapur", "Bilaspur", "Dantewada (South Bastar)", "Dhamtari", "Durg", "Gariyaband", "Janjgir-Champa", "Jashpur", "Kabirdham (Kawardha)", "Kanker (North Bastar)", "Kondagaon", "Korba", "Korea (Koriya)", "Mahasamund", "Mungeli", "Narayanpur", "Raigarh", "Raipur", "Rajnandgaon", "Sukma", "Surajpur  ", "Surguja"] },
            { "state": "Dadra and Nagar Haveli (UT)", "districts": ["Dadra & Nagar Haveli"] },
            { "state": "Daman and Diu (UT)", "districts": ["Daman", "Diu"] },
            { "state": "Delhi (NCT)", "districts": ["Central Delhi", "East Delhi", "New Delhi", "North Delhi", "North East  Delhi", "North West  Delhi", "Shahdara", "South Delhi", "South East Delhi", "South West  Delhi", "West Delhi"] },
            { "state": "Goa", "districts": ["North Goa", "South Goa"] },
            { "state": "Gujarat", "districts": ["Ahmedabad", "Amreli", "Anand", "Aravalli", "Banaskantha (Palanpur)", "Bharuch", "Bhavnagar", "Botad", "Chhota Udepur", "Dahod", "Dangs (Ahwa)", "Devbhoomi Dwarka", "Gandhinagar", "Gir Somnath", "Jamnagar", "Kachchh", "Kheda (Nadiad)", "Mahisagar", "Mehsana", "Morbi", "Narmada (Rajpipla)", "Navsari", "Panchmahal (Godhra)", "Patan", "Porbandar", "Rajkot", "Sabarkantha (Himmatnagar)", "Surat", "Surendranagar", "Tapi (Vyara)", "Vadodara", "Valsad"] },
            { "state": "Haryana", "districts": ["Ambala", "Bhiwani", "Charkhi Dadri", "Faridabad", "Fatehabad", "Gurgaon", "Hisar", "Jhajjar", "Jind", "Kaithal", "Karnal", "Kurukshetra", "Mahendragarh", "Mewat", "Palwal", "Panchkula", "Panipat", "Rewari", "Rohtak", "Sirsa", "Sonipat", "Yamunanagar"] },
            { "state": "Himachal Pradesh", "districts": ["Bilaspur", "Chamba", "Hamirpur", "Kangra", "Kinnaur", "Kullu", "Lahaul &amp; Spiti", "Mandi", "Shimla", "Sirmaur (Sirmour)", "Solan", "Una"] },
            { "state": "Jammu and Kashmir", "districts": ["Anantnag", "Bandipore", "Baramulla", "Budgam", "Doda", "Ganderbal", "Jammu", "Kargil", "Kathua", "Kishtwar", "Kulgam", "Kupwara", "Leh", "Poonch", "Pulwama", "Rajouri", "Ramban", "Reasi", "Samba", "Shopian", "Srinagar", "Udhampur"] },
            { "state": "Jharkhand", "districts": ["Bokaro", "Chatra", "Deoghar", "Dhanbad", "DUMKA", "East Singhbhum", "Garhwa", "Giridih", "Godda", "Gumla", "Hazaribag", "Jamtara", "Khunti", "Koderma", "Latehar", "Lohardaga", "Pakur", "Palamu", "Ramgarh", "Ranchi", "Sahibganj", "Seraikela-Kharsawan", "Simdega", "West Singhbhum"] },
            { "state": "Karnataka", "districts": ["Bagalkot", "Ballari (Bellary)", "Belagavi (Belgaum)", "Bengaluru (Bangalore) Rural", "Bengaluru (Bangalore) Urban", "Bidar", "Chamarajanagar", "Chikballapur", "Chikkamagaluru (Chikmagalur)", "Chitradurga", "Dakshina Kannada", "Davangere", "Dharwad", "Gadag", "Hassan", "Haveri", "Kalaburagi (Gulbarga)", "Kodagu", "Kolar", "Koppal", "Mandya", "Mysuru (Mysore)", "Raichur", "Ramanagara", "Shivamogga (Shimoga)", "Tumakuru (Tumkur)", "Udupi", "Uttara Kannada (Karwar)", "Vijayapura (Bijapur)", "Yadgir"] },
            { "state": "Kerala", "districts": ["Alappuzha", "Ernakulam", "Idukki", "Kannur", "Kasaragod", "Kollam", "Kottayam", "Kozhikode", "Malappuram", "Palakkad", "Pathanamthitta", "Thiruvananthapuram", "Thrissur", "Wayanad"] },
            { "state": "Lakshadweep (UT)", "districts": ["Agatti", "Amini", "Androth", "Bithra", "Chethlath", "Kavaratti", "Kadmath", "Kalpeni", "Kilthan", "Minicoy"] },
            { "state": "Madhya Pradesh", "districts": ["Agar Malwa", "Alirajpur", "Anuppur", "Ashoknagar", "Balaghat", "Barwani", "Betul", "Bhind", "Bhopal", "Burhanpur", "Chhatarpur", "Chhindwara", "Damoh", "Datia", "Dewas", "Dhar", "Dindori", "Guna", "Gwalior", "Harda", "Hoshangabad", "Indore", "Jabalpur", "Jhabua", "Katni", "Khandwa", "Khargone", "Mandla", "Mandsaur", "Morena", "Narsinghpur", "Neemuch", "Panna", "Raisen", "Rajgarh", "Ratlam", "Rewa", "Sagar", "Satna", "Sehore", "Seoni", "Shahdol", "Shajapur", "Sheopur", "Shivpuri", "Sidhi", "Singrauli", "Tikamgarh", "Ujjain", "Umaria", "Vidisha"] },
            { "state": "Maharashtra", "districts": ["Ahmednagar", "Akola", "Amravati", "Aurangabad", "Beed", "Bhandara", "Buldhana", "Chandrapur", "Dhule", "Gadchiroli", "Gondia", "Hingoli", "Jalgaon", "Jalna", "Kolhapur", "Latur", "Mumbai City", "Mumbai Suburban", "Nagpur", "Nanded", "Nandurbar", "Nashik", "Osmanabad", "Palghar", "Parbhani", "Pune", "Raigad", "Ratnagiri", "Sangli", "Satara", "Sindhudurg", "Solapur", "Thane", "Wardha", "Washim", "Yavatmal"] },
            { "state": "Manipur", "districts": ["Bishnupur", "Chandel", "Churachandpur", "Imphal East", "Imphal West", "Jiribam", "Kakching", "Kamjong", "Kangpokpi", "Noney", "Pherzawl", "Senapati", "Tamenglong", "Tengnoupal", "Thoubal", "Ukhrul"] },
            { "state": "Meghalaya", "districts": ["East Garo Hills", "East Jaintia Hills", "East Khasi Hills", "North Garo Hills", "Ri Bhoi", "South Garo Hills", "South West Garo Hills ", "South West Khasi Hills", "West Garo Hills", "West Jaintia Hills", "West Khasi Hills"] },
            { "state": "Mizoram", "districts": ["Aizawl", "Champhai", "Kolasib", "Lawngtlai", "Lunglei", "Mamit", "Saiha", "Serchhip"] },
            { "state": "Nagaland", "districts": ["Dimapur", "Kiphire", "Kohima", "Longleng", "Mokokchung", "Mon", "Peren", "Phek", "Tuensang", "Wokha", "Zunheboto"] },
            { "state": "Odisha", "districts": ["Angul", "Balangir", "Balasore", "Bargarh", "Bhadrak", "Boudh", "Cuttack", "Deogarh", "Dhenkanal", "Gajapati", "Ganjam", "Jagatsinghapur", "Jajpur", "Jharsuguda", "Kalahandi", "Kandhamal", "Kendrapara", "Kendujhar (Keonjhar)", "Khordha", "Koraput", "Malkangiri", "Mayurbhanj", "Nabarangpur", "Nayagarh", "Nuapada", "Puri", "Rayagada", "Sambalpur", "Sonepur", "Sundargarh"] },
            { "state": "Puducherry (UT)", "districts": ["Karaikal", "Mahe", "Pondicherry", "Yanam"] },
            { "state": "Punjab", "districts": ["Amritsar", "Barnala", "Bathinda", "Faridkot", "Fatehgarh Sahib", "Fazilka", "Ferozepur", "Gurdaspur", "Hoshiarpur", "Jalandhar", "Kapurthala", "Ludhiana", "Mansa", "Moga", "Muktsar", "Nawanshahr (Shahid Bhagat Singh Nagar)", "Pathankot", "Patiala", "Rupnagar", "Sahibzada Ajit Singh Nagar (Mohali)", "Sangrur", "Tarn Taran"] },
            { "state": "Rajasthan", "districts": ["Ajmer", "Alwar", "Banswara", "Baran", "Barmer", "Bharatpur", "Bhilwara", "Bikaner", "Bundi", "Chittorgarh", "Churu", "Dausa", "Dholpur", "Dungarpur", "Hanumangarh", "Jaipur", "Jaisalmer", "Jalore", "Jhalawar", "Jhunjhunu", "Jodhpur", "Karauli", "Kota", "Nagaur", "Pali", "Pratapgarh", "Rajsamand", "Sawai Madhopur", "Sikar", "Sirohi", "Sri Ganganagar", "Tonk", "Udaipur"] },
            { "state": "Sikkim", "districts": ["East Sikkim", "North Sikkim", "South Sikkim", "West Sikkim"] },
            { "state": "Tamil Nadu", "districts": ["Ariyalur", "Chennai", "Coimbatore", "Cuddalore", "Dharmapuri", "Dindigul", "Erode", "Kanchipuram", "Kanyakumari", "Karur", "Krishnagiri", "Madurai", "Nagapattinam", "Namakkal", "Nilgiris", "Perambalur", "Pudukkottai", "Ramanathapuram", "Salem", "Sivaganga", "Thanjavur", "Theni", "Thoothukudi (Tuticorin)", "Tiruchirappalli", "Tirunelveli", "Tiruppur", "Tiruvallur", "Tiruvannamalai", "Tiruvarur", "Vellore", "Viluppuram", "Virudhunagar"] },
            { "state": "Telangana", "districts": ["Adilabad", "Bhadradri Kothagudem", "Hyderabad", "Jagtial", "Jangaon", "Jayashankar Bhoopalpally", "Jogulamba Gadwal", "Kamareddy", "Karimnagar", "Khammam", "Komaram Bheem Asifabad", "Mahabubabad", "Mahabubnagar", "Mancherial", "Medak", "Medchal", "Nagarkurnool", "Nalgonda", "Nirmal", "Nizamabad", "Peddapalli", "Rajanna Sircilla", "Rangareddy", "Sangareddy", "Siddipet", "Suryapet", "Vikarabad", "Wanaparthy", "Warangal (Rural)", "Warangal (Urban)", "Yadadri Bhuvanagiri"] },
            { "state": "Tripura", "districts": ["Dhalai", "Gomati", "Khowai", "North Tripura", "Sepahijala", "South Tripura", "Unakoti", "West Tripura"] },
            { "state": "Uttarakhand", "districts": ["Almora", "Bageshwar", "Chamoli", "Champawat", "Dehradun", "Haridwar", "Nainital", "Pauri Garhwal", "Pithoragarh", "Rudraprayag", "Tehri Garhwal", "Udham Singh Nagar", "Uttarkashi"] },
            { "state": "Uttar Pradesh", "districts": ["Agra", "Aligarh", "Allahabad", "Ambedkar Nagar", "Amethi (Chatrapati Sahuji Mahraj Nagar)", "Amroha (J.P. Nagar)", "Auraiya", "Azamgarh", "Baghpat", "Bahraich", "Ballia", "Balrampur", "Banda", "Barabanki", "Bareilly", "Basti", "Bhadohi", "Bijnor", "Budaun", "Bulandshahr", "Chandauli", "Chitrakoot", "Deoria", "Etah", "Etawah", "Faizabad", "Farrukhabad", "Fatehpur", "Firozabad", "Gautam Buddha Nagar", "Ghaziabad", "Ghazipur", "Gonda", "Gorakhpur", "Hamirpur", "Hapur (Panchsheel Nagar)", "Hardoi", "Hathras", "Jalaun", "Jaunpur", "Jhansi", "Kannauj", "Kanpur Dehat", "Kanpur Nagar", "Kanshiram Nagar (Kasganj)", "Kaushambi", "Kushinagar (Padrauna)", "Lakhimpur - Kheri", "Lalitpur", "Lucknow", "Maharajganj", "Mahoba", "Mainpuri", "Mathura", "Mau", "Meerut", "Mirzapur", "Moradabad", "Muzaffarnagar", "Pilibhit", "Pratapgarh", "RaeBareli", "Rampur", "Saharanpur", "Sambhal (Bhim Nagar)", "Sant Kabir Nagar", "Shahjahanpur", "Shamali (Prabuddh Nagar)", "Shravasti", "Siddharth Nagar", "Sitapur", "Sonbhadra", "Sultanpur", "Unnao", "Varanasi"] },
            { "state": "West Bengal", "districts": ["Alipurduar", "Bankura", "Birbhum", "Burdwan (Bardhaman)", "Cooch Behar", "Dakshin Dinajpur (South Dinajpur)", "Darjeeling", "Hooghly", "Howrah", "Jalpaiguri", "Kalimpong", "Kolkata", "Malda", "Murshidabad", "Nadia", "North 24 Parganas", "Paschim Medinipur (West Medinipur)", "Purba Medinipur (East Medinipur)", "Purulia", "South 24 Parganas", "Uttar Dinajpur (North Dinajpur)"] }
        ];

        const stateMap = new Map<string, string>(); // To store stateName -> stateId
        for (const stateData of statesData) {
            const stateId = uuidv4();
            await queryRunner.query(
                `INSERT INTO "states" (id, country_id, name, created_at, updated_at) VALUES ($1, $2, $3, NOW(), NOW())`,
                [stateId, indiaId, stateData.state]
            );
            stateMap.set(stateData.state, stateId);

            // Insert Districts for this state
            for (const districtName of stateData.districts) {
                await queryRunner.query(
                    `INSERT INTO "districts" (id, state_id, name, created_at, updated_at) VALUES ($1, $2, $3, NOW(), NOW())`,
                    [uuidv4(), stateId, districtName]
                );
            }
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // --- Delete data in reverse order of creation to respect foreign key constraints ---

        // Collect all district names to delete
        const allDistrictNames: string[] = [];
        const statesData = [
            { "state": "Andhra Pradesh", "districts": ["Anantapur", "Chittoor", "East Godavari", "Guntur", "Krishna", "Kurnool", "Nellore", "Prakasam", "Srikakulam", "Visakhapatnam", "Vizianagaram", "West Godavari", "YSR Kadapa"] },
            { "state": "Arunachal Pradesh", "districts": ["Tawang", "West Kameng", "East Kameng", "Papum Pare", "Kurung Kumey", "Kra Daadi", "Lower Subansiri", "Upper Subansiri", "West Siang", "East Siang", "Siang", "Upper Siang", "Lower Siang", "Lower Dibang Valley", "Dibang Valley", "Anjaw", "Lohit", "Namsai", "Changlang", "Tirap", "Longding"] },
            { "state": "Assam", "districts": ["Baksa", "Barpeta", "Biswanath", "Bongaigaon", "Cachar", "Charaideo", "Chirang", "Darrang", "Dhemaji", "Dhubri", "Dibrugarh", "Goalpara", "Golaghat", "Hailakandi", "Hojai", "Jorhat", "Kamrup Metropolitan", "Kamrup", "Karbi Anglong", "Karimganj", "Kokrajhar", "Lakhimpur", "Majuli", "Morigaon", "Nagaon", "Nalbari", "Dima Hasao", "Sivasagar", "Sonitpur", "South Salmara-Mankachar", "Tinsukia", "Udalguri", "West Karbi Anglong"] },
            { "state": "Bihar", "districts": ["Araria", "Arwal", "Aurangabad", "Banka", "Begusarai", "Bhagalpur", "Bhojpur", "Buxar", "Darbhanga", "East Champaran (Motihari)", "Gaya", "Gopalganj", "Jamui", "Jehanabad", "Kaimur (Bhabua)", "Katihar", "Khagaria", "Kishanganj", "Lakhisarai", "Madhepura", "Madhubani", "Munger (Monghyr)", "Muzaffarpur", "Nalanda", "Nawada", "Patna", "Purnia (Purnea)", "Rohtas", "Saharsa", "Samastipur", "Saran", "Sheikhpura", "Sheohar", "Sitamarhi", "Siwan", "Supaul", "Vaishali", "West Champaran"] },
            { "state": "Chandigarh (UT)", "districts": ["Chandigarh"] },
            { "state": "Chhattisgarh", "districts": ["Balod", "Baloda Bazar", "Balrampur", "Bastar", "Bemetara", "Bijapur", "Bilaspur", "Dantewada (South Bastar)", "Dhamtari", "Durg", "Gariyaband", "Janjgir-Champa", "Jashpur", "Kabirdham (Kawardha)", "Kanker (North Bastar)", "Kondagaon", "Korba", "Korea (Koriya)", "Mahasamund", "Mungeli", "Narayanpur", "Raigarh", "Raipur", "Rajnandgaon", "Sukma", "Surajpur  ", "Surguja"] },
            { "state": "Dadra and Nagar Haveli (UT)", "districts": ["Dadra & Nagar Haveli"] },
            { "state": "Daman and Diu (UT)", "districts": ["Daman", "Diu"] },
            { "state": "Delhi (NCT)", "districts": ["Central Delhi", "East Delhi", "New Delhi", "North Delhi", "North East  Delhi", "North West  Delhi", "Shahdara", "South Delhi", "South East Delhi", "South West  Delhi", "West Delhi"] },
            { "state": "Goa", "districts": ["North Goa", "South Goa"] },
            { "state": "Gujarat", "districts": ["Ahmedabad", "Amreli", "Anand", "Aravalli", "Banaskantha (Palanpur)", "Bharuch", "Bhavnagar", "Botad", "Chhota Udepur", "Dahod", "Dangs (Ahwa)", "Devbhoomi Dwarka", "Gandhinagar", "Gir Somnath", "Jamnagar", "Junagadh", "Kachchh", "Kheda (Nadiad)", "Mahisagar", "Mehsana", "Morbi", "Narmada (Rajpipla)", "Navsari", "Panchmahal (Godhra)", "Patan", "Porbandar", "Rajkot", "Sabarkantha (Himmatnagar)", "Surat", "Surendranagar", "Tapi (Vyara)", "Vadodara", "Valsad"] },
            { "state": "Haryana", "districts": ["Ambala", "Bhiwani", "Charkhi Dadri", "Faridabad", "Fatehabad", "Gurgaon", "Hisar", "Jhajjar", "Jind", "Kaithal", "Karnal", "Kurukshetra", "Mahendragarh", "Mewat", "Palwal", "Panchkula", "Panipat", "Rewari", "Rohtak", "Sirsa", "Sonipat", "Yamunanagar"] },
            { "state": "Himachal Pradesh", "districts": ["Bilaspur", "Chamba", "Hamirpur", "Kangra", "Kinnaur", "Kullu", "Lahaul &amp; Spiti", "Mandi", "Shimla", "Sirmaur (Sirmour)", "Solan", "Una"] },
            { "state": "Jammu and Kashmir", "districts": ["Anantnag", "Bandipore", "Baramulla", "Budgam", "Doda", "Ganderbal", "Jammu", "Kargil", "Kathua", "Kishtwar", "Kulgam", "Kupwara", "Leh", "Poonch", "Pulwama", "Rajouri", "Ramban", "Reasi", "Samba", "Shopian", "Srinagar", "Udhampur"] },
            { "state": "Jharkhand", "districts": ["Bokaro", "Chatra", "Deoghar", "Dhanbad", "DUMKA", "East Singhbhum", "Garhwa", "Giridih", "Godda", "Gumla", "Hazaribag", "Jamtara", "Khunti", "Koderma", "Latehar", "Lohardaga", "Pakur", "Palamu", "Ramgarh", "Ranchi", "Sahibganj", "Seraikela-Kharsawan", "Simdega", "West Singhbhum"] },
            { "state": "Karnataka", "districts": ["Bagalkot", "Ballari (Bellary)", "Belagavi (Belgaum)", "Bengaluru (Bangalore) Rural", "Bengaluru (Bangalore) Urban", "Bidar", "Chamarajanagar", "Chikballapur", "Chikkamagaluru (Chikmagalur)", "Chitradurga", "Dakshina Kannada", "Davangere", "Dharwad", "Gadag", "Hassan", "Haveri", "Kalaburagi (Gulbarga)", "Kodagu", "Kolar", "Koppal", "Mandya", "Mysuru (Mysore)", "Raichur", "Ramanagara", "Shivamogga (Shimoga)", "Tumakuru (Tumkur)", "Udupi", "Uttara Kannada (Karwar)", "Vijayapura (Bijapur)", "Yadgir"] },
            { "state": "Kerala", "districts": ["Alappuzha", "Ernakulam", "Idukki", "Kannur", "Kasaragod", "Kollam", "Kottayam", "Kozhikode", "Malappuram", "Palakkad", "Pathanamthitta", "Thiruvananthapuram", "Thrissur", "Wayanad"] },
            { "state": "Lakshadweep (UT)", "districts": ["Agatti", "Amini", "Androth", "Bithra", "Chethlath", "Kavaratti", "Kadmath", "Kalpeni", "Kilthan", "Minicoy"] },
            { "state": "Madhya Pradesh", "districts": ["Agar Malwa", "Alirajpur", "Anuppur", "Ashoknagar", "Balaghat", "Barwani", "Betul", "Bhind", "Bhopal", "Burhanpur", "Chhatarpur", "Chhindwara", "Damoh", "Datia", "Dewas", "Dhar", "Dindori", "Guna", "Gwalior", "Harda", "Hoshangabad", "Indore", "Jabalpur", "Jhabua", "Katni", "Khandwa", "Khargone", "Mandla", "Mandsaur", "Morena", "Narsinghpur", "Neemuch", "Panna", "Raisen", "Rajgarh", "Ratlam", "Rewa", "Sagar", "Satna", "Sehore", "Seoni", "Shahdol", "Shajapur", "Sheopur", "Shivpuri", "Sidhi", "Singrauli", "Tikamgarh", "Ujjain", "Umaria", "Vidisha"] },
            { "state": "Maharashtra", "districts": ["Ahmednagar", "Akola", "Amravati", "Aurangabad", "Beed", "Bhandara", "Buldhana", "Chandrapur", "Dhule", "Gadchiroli", "Gondia", "Hingoli", "Jalgaon", "Jalna", "Kolhapur", "Latur", "Mumbai City", "Mumbai Suburban", "Nagpur", "Nanded", "Nandurbar", "Nashik", "Osmanabad", "Palghar", "Parbhani", "Pune", "Raigad", "Ratnagiri", "Sangli", "Satara", "Sindhudurg", "Solapur", "Thane", "Wardha", "Washim", "Yavatmal"] },
            { "state": "Manipur", "districts": ["Bishnupur", "Chandel", "Churachandpur", "Imphal East", "Imphal West", "Jiribam", "Kakching", "Kamjong", "Kangpokpi", "Noney", "Pherzawl", "Senapati", "Tamenglong", "Tengnoupal", "Thoubal", "Ukhrul"] },
            { "state": "Meghalaya", "districts": ["East Garo Hills", "East Jaintia Hills", "East Khasi Hills", "North Garo Hills", "Ri Bhoi", "South Garo Hills", "South West Garo Hills ", "South West Khasi Hills", "West Garo Hills", "West Jaintia Hills", "West Khasi Hills"] },
            { "state": "Mizoram", "districts": ["Aizawl", "Champhai", "Kolasib", "Lawngtlai", "Lunglei", "Mamit", "Saiha", "Serchhip"] },
            { "state": "Nagaland", "districts": ["Dimapur", "Kiphire", "Kohima", "Longleng", "Mokokchung", "Mon", "Peren", "Phek", "Tuensang", "Wokha", "Zunheboto"] },
            { "state": "Odisha", "districts": ["Angul", "Balangir", "Balasore", "Bargarh", "Bhadrak", "Boudh", "Cuttack", "Deogarh", "Dhenkanal", "Gajapati", "Ganjam", "Jagatsinghapur", "Jajpur", "Jharsuguda", "Kalahandi", "Kandhamal", "Kendrapara", "Kendujhar (Keonjhar)", "Khordha", "Koraput", "Malkangiri", "Mayurbhanj", "Nabarangpur", "Nayagarh", "Nuapada", "Puri", "Rayagada", "Sambalpur", "Sonepur", "Sundargarh"] },
            { "state": "Puducherry (UT)", "districts": ["Karaikal", "Mahe", "Pondicherry", "Yanam"] },
            { "state": "Punjab", "districts": ["Amritsar", "Barnala", "Bathinda", "Faridkot", "Fatehgarh Sahib", "Fazilka", "Ferozepur", "Gurdaspur", "Hoshiarpur", "Jalandhar", "Kapurthala", "Ludhiana", "Mansa", "Moga", "Muktsar", "Nawanshahr (Shahid Bhagat Singh Nagar)", "Pathankot", "Patiala", "Rupnagar", "Sahibzada Ajit Singh Nagar (Mohali)", "Sangrur", "Tarn Taran"] },
            { "state": "Rajasthan", "districts": ["Ajmer", "Alwar", "Banswara", "Baran", "Barmer", "Bharatpur", "Bhilwara", "Bikaner", "Bundi", "Chittorgarh", "Churu", "Dausa", "Dholpur", "Dungarpur", "Hanumangarh", "Jaipur", "Jaisalmer", "Jalore", "Jhalawar", "Jhunjhunu", "Jodhpur", "Karauli", "Kota", "Nagaur", "Pali", "Pratapgarh", "Rajsamand", "Sawai Madhopur", "Sikar", "Sirohi", "Sri Ganganagar", "Tonk", "Udaipur"] },
            { "state": "Sikkim", "districts": ["East Sikkim", "North Sikkim", "South Sikkim", "West Sikkim"] },
            { "state": "Tamil Nadu", "districts": ["Ariyalur", "Chennai", "Coimbatore", "Cuddalore", "Dharmapuri", "Dindigul", "Erode", "Kanchipuram", "Kanyakumari", "Karur", "Krishnagiri", "Madurai", "Nagapattinam", "Namakkal", "Nilgiris", "Perambalur", "Pudukkottai", "Ramanathapuram", "Salem", "Sivaganga", "Thanjavur", "Theni", "Thoothukudi (Tuticorin)", "Tiruchirappalli", "Tirunelveli", "Tiruppur", "Tiruvallur", "Tiruvannamalai", "Tiruvarur", "Vellore", "Viluppuram", "Virudhunagar"] },
            { "state": "Telangana", "districts": ["Adilabad", "Bhadradri Kothagudem", "Hyderabad", "Jagtial", "Jangaon", "Jayashankar Bhoopalpally", "Jogulamba Gadwal", "Kamareddy", "Karimnagar", "Khammam", "Komaram Bheem Asifabad", "Mahabubabad", "Mahabubnagar", "Mancherial", "Medak", "Medchal", "Nagarkurnool", "Nalgonda", "Nirmal", "Nizamabad", "Peddapalli", "Rajanna Sircilla", "Rangareddy", "Sangareddy", "Siddipet", "Suryapet", "Vikarabad", "Wanaparthy", "Warangal (Rural)", "Warangal (Urban)", "Yadadri Bhuvanagiri"] },
            { "state": "Tripura", "districts": ["Dhalai", "Gomati", "Khowai", "North Tripura", "Sepahijala", "South Tripura", "Unakoti", "West Tripura"] },
            { "state": "Uttarakhand", "districts": ["Almora", "Bageshwar", "Chamoli", "Champawat", "Dehradun", "Haridwar", "Nainital", "Pauri Garhwal", "Pithoragarh", "Rudraprayag", "Tehri Garhwal", "Udham Singh Nagar", "Uttarkashi"] },
            { "state": "Uttar Pradesh", "districts": ["Agra", "Aligarh", "Allahabad", "Ambedkar Nagar", "Amethi (Chatrapati Sahuji Mahraj Nagar)", "Amroha (J.P. Nagar)", "Auraiya", "Azamgarh", "Baghpat", "Bahraich", "Ballia", "Balrampur", "Banda", "Barabanki", "Bareilly", "Basti", "Bhadohi", "Bijnor", "Budaun", "Bulandshahr", "Chandauli", "Chitrakoot", "Deoria", "Etah", "Etawah", "Faizabad", "Farrukhabad", "Fatehpur", "Firozabad", "Gautam Buddha Nagar", "Ghaziabad", "Ghazipur", "Gonda", "Gorakhpur", "Hamirpur", "Hapur (Panchsheel Nagar)", "Hardoi", "Hathras", "Jalaun", "Jaunpur", "Jhansi", "Kannauj", "Kanpur Dehat", "Kanpur Nagar", "Kanshiram Nagar (Kasganj)", "Kaushambi", "Kushinagar (Padrauna)", "Lakhimpur - Kheri", "Lalitpur", "Lucknow", "Maharajganj", "Mahoba", "Mainpuri", "Mathura", "Mau", "Meerut", "Mirzapur", "Moradabad", "Muzaffarnagar", "Pilibhit", "Pratapgarh", "RaeBareli", "Rampur", "Saharanpur", "Sambhal (Bhim Nagar)", "Sant Kabir Nagar", "Shahjahanpur", "Shamali (Prabuddh Nagar)", "Shravasti", "Siddharth Nagar", "Sitapur", "Sonbhadra", "Sultanpur", "Unnao", "Varanasi"] },
            { "state": "West Bengal", "districts": ["Alipurduar", "Bankura", "Birbhum", "Burdwan (Bardhaman)", "Cooch Behar", "Dakshin Dinajpur (South Dinajpur)", "Darjeeling", "Hooghly", "Howrah", "Jalpaiguri", "Kalimpong", "Kolkata", "Malda", "Murshidabad", "Nadia", "North 24 Parganas", "Paschim Medinipur (West Medinipur)", "Purba Medinipur (East Medinipur)", "Purulia", "South 24 Parganas", "Uttar Dinajpur (North Dinajpur)"] }
        ];
        
        for (const stateData of statesData) {
            allDistrictNames.push(...stateData.districts);
        }

        if (allDistrictNames.length > 0) {
            // Split deletions into chunks to avoid too many parameters in a single query
            const chunkSize = 500; // Adjust chunk size as needed
            for (let i = 0; i < allDistrictNames.length; i += chunkSize) {
                const chunk = allDistrictNames.slice(i, i + chunkSize);
                await queryRunner.query(`DELETE FROM "districts" WHERE name IN (${chunk.map(d => `'${d.replace(/'/g, "''")}'`).join(', ')})`);
            }
        }
        

        // Delete States (linked to India)
        const indiaCountryResult = await queryRunner.query(`SELECT id FROM "countries" WHERE name = 'India'`);
        if (indiaCountryResult.length > 0) {
            const indiaId = indiaCountryResult[0].id;
            await queryRunner.query(`DELETE FROM "states" WHERE country_id = $1`, [indiaId]);
        }

        // Delete Countries
        await queryRunner.query(`DELETE FROM "countries" WHERE name = 'India'`);

        // Delete Service Types
        const serviceTypeNamesToDelete = [
            'Restaurants', 'Cafes', 'Food Delivery', 'Taxi', 'Auto', 'Courier Delivery',
            'Medical Consultation', 'Pharmacy Delivery', 'Wellness Services',
            'Salon Services', 'Spa & Massage', 'Grooming',
            'Tutoring', 'Skills Training', 'Language Classes',
            'Consulting', 'Legal Services', 'Financial Advisory',
            'Event Management', 'Photography', 'Music Lessons'
        ];
        if (serviceTypeNamesToDelete.length > 0) {
            await queryRunner.query(`DELETE FROM "service_types" WHERE name IN (${serviceTypeNamesToDelete.map(st => `'${st}'`).join(', ')})`);
        }

        // Delete Service Categories
        const categoryNamesToDelete = [
            'Household Services', 'Grocery', 'Food & Beverage', 'Transportation',
            'Healthcare', 'Beauty & Care', 'Education', 'Professional', 'Entertainment'
        ];
        if (categoryNamesToDelete.length > 0) {
            await queryRunner.query(`DELETE FROM "service_categories" WHERE name IN (${categoryNamesToDelete.map(c => `'${c}'`).join(', ')})`);
        }
    }
}
