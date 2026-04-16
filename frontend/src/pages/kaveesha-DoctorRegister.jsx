import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const SPECIALTIES = [
  'Cardiology', 'Dermatology', 'Endocrinology', 'Gastroenterology',
  'General Practice', 'Gynecology', 'Hematology', 'Neurology',
  'Oncology', 'Ophthalmology', 'Orthopedics', 'Otolaryngology',
  'Pediatrics', 'Psychiatry', 'Pulmonology', 'Radiology',
  'Rheumatology', 'Urology', 'Emergency Medicine', 'Anesthesiology',
  'Pathology', 'Plastic Surgery', 'Sports Medicine'
];

const ISSUING_AUTHORITIES = [
  'Sri Lanka Medical Council (SLMC)',
  'General Medical Council (GMC) - UK',
  'Medical Council of India (MCI)',
  'American Board of Medical Specialties (ABMS)',
  'Australian Medical Council (AMC)',
  'Other'
];

// Simulated already-registered license numbers (replace with API call if needed)
const REGISTERED_LICENSE_NUMBERS = ['SLMC-00001', 'SLMC-12345', 'GMC-99999', 'MCI-11111'];

const colors = {
  navy: '#184e77',
  teal: '#34a0a4',
  mint: '#76c893',
  cream: '#f1faee',
  blush: '#ffe5ec',
  navyLight: '#1e6091',
  tealLight: '#52b5b9',
  mintDark: '#52a870',
  error: '#c0392b',
  errorBg: '#fdecea',
  success: '#27ae60',
  successBg: '#eafaf1',
  gray: '#6b7280',
  grayLight: '#f4f6f8',
  border: '#d1dde8',
  text: '#1a2e40',
};

const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600;700&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: 'DM Sans', sans-serif;
    background: ${colors.cream};
    min-height: 100vh;
  }

  input:focus, select:focus, textarea:focus {
    outline: none;
    border-color: ${colors.teal} !important;
    box-shadow: 0 0 0 3px rgba(52, 160, 164, 0.15);
    background: #fff !important;
  }

  input[type="number"]::-webkit-inner-spin-button,
  input[type="number"]::-webkit-outer-spin-button { -webkit-appearance: none; }

  .btn-primary {
    background: linear-gradient(135deg, ${colors.navy} 0%, ${colors.teal} 100%);
    color: white;
    border: none;
    border-radius: 14px;
    padding: 16px 32px;
    font-size: 17px;
    font-weight: 700;
    font-family: 'DM Sans', sans-serif;
    cursor: pointer;
    transition: all 0.25s ease;
    letter-spacing: 0.3px;
  }
  .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(24, 78, 119, 0.35); }
  .btn-primary:active { transform: translateY(0px); }
  .btn-primary:disabled { background: #b0bec5; cursor: not-allowed; transform: none; box-shadow: none; }

  .btn-secondary {
    background: white;
    color: ${colors.navy};
    border: 2px solid ${colors.border};
    border-radius: 14px;
    padding: 14px 32px;
    font-size: 17px;
    font-weight: 600;
    font-family: 'DM Sans', sans-serif;
    cursor: pointer;
    transition: all 0.25s ease;
  }
  .btn-secondary:hover { border-color: ${colors.teal}; color: ${colors.teal}; background: #f0fafa; }

  .step-circle {
    transition: all 0.35s ease;
  }

  .file-upload-box {
    transition: all 0.2s ease;
  }
  .file-upload-box:hover {
    border-color: ${colors.teal} !important;
    background: #f0fafa !important;
  }

  .field-wrapper { margin-bottom: 22px; }

  select option { color: ${colors.text}; }

  .review-row:last-child { border-bottom: none !important; }
`;

// ── Validation helpers ──────────────────────────────────────────────
const todayStr = () => {
  const d = new Date();
  return d.toISOString().split('T')[0];
};

const validateField = (name, value, formData, files) => {
  switch (name) {
    case 'first_name':
      if (!value.trim()) return 'First name is required';
      if (!/^[a-zA-Z\s'-]+$/.test(value)) return 'Only letters, spaces, hyphens and apostrophes allowed';
      if (value.trim().length < 2) return 'First name must be at least 2 characters';
      return '';
    case 'last_name':
      if (!value.trim()) return 'Last name is required';
      if (!/^[a-zA-Z\s'-]+$/.test(value)) return 'Only letters, spaces, hyphens and apostrophes allowed';
      if (value.trim().length < 2) return 'Last name must be at least 2 characters';
      return '';
    case 'email':
      if (!value.trim()) return 'Email address is required';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Enter a valid email address';
      return '';
    case 'password':
      if (!value) return 'Password is required';
      if (value.length < 8) return 'Password must be at least 8 characters';
      if (!/(?=.*[a-z])/.test(value)) return 'Must include a lowercase letter';
      if (!/(?=.*[A-Z])/.test(value)) return 'Must include an uppercase letter';
      if (!/(?=.*\d)/.test(value)) return 'Must include a number';
      if (!/(?=.*[@$!%*?&#])/.test(value)) return 'Must include a special character (@$!%*?&#)';
      return '';
    case 'confirm_password':
      if (!value) return 'Please confirm your password';
      if (value !== formData.password) return 'Passwords do not match';
      return '';
    case 'phone':
      if (!value.trim()) return 'Phone number is required';
      if (!/^\d{10}$/.test(value.replace(/\s/g, ''))) return 'Phone number must be exactly 10 digits';
      return '';
    case 'date_of_birth':
      if (value) {
        if (value >= todayStr()) return 'Date of birth cannot be today or a future date';
        const age = (new Date() - new Date(value)) / (365.25 * 24 * 3600 * 1000);
        if (age < 22) return 'Doctor must be at least 22 years old';
        if (age > 90) return 'Please enter a valid date of birth';
      }
      return '';
    case 'gender':
      return '';
    case 'specialty':
      if (!value) return 'Please select a specialty';
      return '';
    case 'sub_specialty':
      if (value && !/^[a-zA-Z\s/(),-]+$/.test(value)) return 'Invalid characters in sub-specialty';
      return '';
    case 'medical_license_number':
      if (!value.trim()) return 'Medical license number is required';
      if (!/^[A-Z]{2,6}-\d{4,8}$/.test(value.trim())) return 'Format: SLMC-12345 (letters, hyphen, digits)';
      if (REGISTERED_LICENSE_NUMBERS.includes(value.trim().toUpperCase())) return 'This license number is already registered';
      return '';
    case 'license_issuing_authority':
      if (!value) return 'Please select the issuing authority';
      return '';
    case 'years_of_experience':
      if (value === '' || value === null || value === undefined) return 'Years of experience is required';
      const yr = parseInt(value);
      if (isNaN(yr)) return 'Must be a number';
      if (yr < 0) return 'Cannot be negative';
      if (yr > 60) return 'Please enter a realistic value (0–60)';
      return '';
    case 'hospital':
      if (!value.trim()) return 'Hospital / Workplace name is required';
      if (value.trim().length < 3) return 'Must be at least 3 characters';
      return '';
    case 'hospital_address':
      return '';
    case 'profile_photo':
      if (!files?.profile_photo) return 'Profile photo is required';
      return '';
    case 'id_card_front':
      if (!files?.id_card_front) return 'ID card (front) is required';
      return '';
    case 'id_card_back':
      if (!files?.id_card_back) return 'ID card (back) is required';
      return '';
    case 'medical_license':
      if (!files?.medical_license) return 'Medical license is required';
      return '';
    case 'degree_certificates':
      if (!files?.degree_certificates) return 'Degree certificate is required';
      return '';
    default:
      return '';
  }
};

// ── Main Component ──────────────────────────────────────────────────
export default function KaveeshaDoctorRegister() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [touched, setTouched] = useState({});

  const [formData, setFormData] = useState({
    first_name: '', last_name: '', email: '', password: '', confirm_password: '',
    phone: '', date_of_birth: '', gender: '', specialty: '', sub_specialty: '',
    hospital: '', hospital_address: '', medical_license_number: '',
    license_issuing_authority: '', years_of_experience: '',
  });

  const [files, setFiles] = useState({
    profile_photo: null, id_card_front: null, id_card_back: null,
    medical_license: null, degree_certificates: null,
  });

  const [errors, setErrors] = useState({});
  const [serverErrors, setServerErrors] = useState([]);

  // Revalidate confirm_password when password changes
  useEffect(() => {
    if (touched.confirm_password && formData.confirm_password) {
      setErrors(prev => ({
        ...prev,
        confirm_password: validateField('confirm_password', formData.confirm_password, formData, files),
      }));
    }
  }, [formData.password]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Phone: digits only
    if (name === 'phone') {
      const cleaned = value.replace(/\D/g, '').slice(0, 10);
      setFormData(prev => ({ ...prev, [name]: cleaned }));
      if (touched[name]) {
        setErrors(prev => ({ ...prev, [name]: validateField(name, cleaned, formData, files) }));
      }
      return;
    }

    // Years of experience: digits only
    if (name === 'years_of_experience') {
      const cleaned = value.replace(/\D/g, '').slice(0, 2);
      setFormData(prev => ({ ...prev, [name]: cleaned }));
      if (touched[name]) {
        setErrors(prev => ({ ...prev, [name]: validateField(name, cleaned, formData, files) }));
      }
      return;
    }

    setFormData(prev => ({ ...prev, [name]: value }));
    if (touched[name]) {
      setErrors(prev => ({ ...prev, [name]: validateField(name, value, { ...formData, [name]: value }, files) }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    setErrors(prev => ({ ...prev, [name]: validateField(name, value, formData, files) }));
  };

  const handleFileChange = (e) => {
    const { name, files: inputFiles } = e.target;
    const file = inputFiles[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, [name]: 'File size must be less than 5MB' }));
      return;
    }
    setFiles(prev => ({ ...prev, [name]: file }));
    setErrors(prev => ({ ...prev, [name]: '' }));
    setTouched(prev => ({ ...prev, [name]: true }));
  };

  const validateStep = (currentStep) => {
    const stepFields = {
      1: ['first_name', 'last_name', 'email', 'password', 'confirm_password', 'phone', 'date_of_birth'],
      2: ['specialty', 'medical_license_number', 'license_issuing_authority', 'years_of_experience', 'hospital'],
      3: ['profile_photo', 'id_card_front', 'id_card_back', 'medical_license', 'degree_certificates'],
    };

    const fields = stepFields[currentStep] || [];
    const newErrors = {};
    const newTouched = {};

    fields.forEach(field => {
      newTouched[field] = true;
      const err = validateField(field, formData[field] || '', formData, files);
      if (err) newErrors[field] = err;
    });

    setTouched(prev => ({ ...prev, ...newTouched }));
    setErrors(prev => ({ ...prev, ...newErrors }));
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    setServerErrors([]);
    if (validateStep(step)) setStep(prev => prev + 1);
  };

  const handlePrevious = () => {
    setStep(prev => prev - 1);
    setServerErrors([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Only allow submission on step 4 (Review)
    if (step !== 4) {
      console.log('Form submission blocked - not on step 4');
      return;
    }
    
    setServerErrors([]);
    if (!validateStep(3)) return;
    setLoading(true);
    try {
      const formDataObj = new FormData();
      Object.keys(formData).forEach(key => { if (formData[key]) formDataObj.append(key, formData[key]); });
      Object.keys(files).forEach(key => { if (files[key]) formDataObj.append(key, files[key]); });

      const response = await fetch('http://localhost:8080/doctors/register', {
        method: 'POST',
        body: formDataObj,
      });

      const contentType = response.headers.get('content-type');
      let data;
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        console.error('Non-JSON response:', text);
        throw new Error('Server returned invalid response');
      }

      if (response.ok && (data.success || data.message)) {
        setSuccess(true);
      } else {
        setServerErrors(data.errors || [data.message || 'Registration failed']);
      }
    } catch (error) {
      console.error('Registration error:', error);
      setServerErrors(['Network error. Please check your connection and try again.']);
    } finally {
      setLoading(false);
    }
  };

  // ── Success Screen ──
  if (success) {
    return (
      <>
        <style>{globalStyles}</style>
        <div style={{
          minHeight: '100vh',
          background: `linear-gradient(135deg, ${colors.navy} 0%, ${colors.teal} 60%, ${colors.mint} 100%)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px',
        }}>
          <div style={{
            background: 'white', borderRadius: '28px', padding: '60px 50px',
            maxWidth: '580px', width: '100%', textAlign: 'center',
            boxShadow: '0 32px 80px rgba(24,78,119,0.25)',
          }}>
            <div style={{
              width: '110px', height: '110px', borderRadius: '50%',
              background: `linear-gradient(135deg, ${colors.mint} 0%, ${colors.teal} 100%)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 32px', fontSize: '52px', color: 'white',
              boxShadow: `0 12px 32px rgba(118,200,147,0.4)`,
            }}>✓</div>
            <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: '36px', color: colors.navy, marginBottom: '14px' }}>
              Registration Submitted!
            </h1>
            <p style={{ fontSize: '17px', color: colors.gray, marginBottom: '36px', lineHeight: 1.7 }}>
              Your application has been received. Our admin team will verify your credentials shortly.
            </p>
            <div style={{ background: colors.cream, borderRadius: '16px', padding: '28px', marginBottom: '28px', textAlign: 'left' }}>
              <h3 style={{ fontSize: '17px', color: colors.navy, fontWeight: 700, marginBottom: '16px' }}>What happens next?</h3>
              {['Our team will review your application', 'You\'ll receive an email once verified', 'After approval, you can log in', 'This process usually takes 24–48 hours'].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px', color: colors.text, fontSize: '15px' }}>
                  <span style={{ width: '22px', height: '22px', borderRadius: '50%', background: colors.mint, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', color: 'white', flexShrink: 0 }}>✓</span>
                  {item}
                </div>
              ))}
            </div>
            <div style={{ background: colors.blush, borderRadius: '12px', padding: '16px', marginBottom: '28px' }}>
              <p style={{ color: colors.navy, fontWeight: 600, fontSize: '15px', margin: 0 }}>
                📧 Please check your email for a confirmation message
              </p>
            </div>
            <button className="btn-primary" style={{ width: '100%' }} onClick={() => navigate('/login')}>
              Go to Login Page
            </button>
          </div>
        </div>
      </>
    );
  }

  // ── Step Content ──
  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div>
            <StepHeader icon="👤" title="Personal Information" subtitle="Please provide your basic personal details" />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <Field label="First Name" required name="first_name" value={formData.first_name}
                placeholder="John" onChange={handleChange} onBlur={handleBlur} error={errors.first_name} touched={touched.first_name} />
              <Field label="Last Name" required name="last_name" value={formData.last_name}
                placeholder="Doe" onChange={handleChange} onBlur={handleBlur} error={errors.last_name} touched={touched.last_name} />
            </div>
            <Field label="Email Address" required name="email" type="email" value={formData.email}
              placeholder="john.doe@example.com" onChange={handleChange} onBlur={handleBlur} error={errors.email} touched={touched.email} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <Field label="Password" required name="password" type="password" value={formData.password}
                placeholder="Min. 8 characters" onChange={handleChange} onBlur={handleBlur} error={errors.password} touched={touched.password}
                hint="Uppercase, lowercase, number & special character (@$!%*?&#)" />
              <Field label="Confirm Password" required name="confirm_password" type="password" value={formData.confirm_password}
                placeholder="Re-enter password" onChange={handleChange} onBlur={handleBlur} error={errors.confirm_password} touched={touched.confirm_password}
                successMsg={!errors.confirm_password && formData.confirm_password && formData.password === formData.confirm_password ? '✓ Passwords match' : ''} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <Field label="Phone Number" required name="phone" type="text" value={formData.phone}
                placeholder="0771234567" onChange={handleChange} onBlur={handleBlur} error={errors.phone} touched={touched.phone}
                hint="10 digits only, no spaces or symbols" maxLength={10} />
              <Field label="Date of Birth" name="date_of_birth" type="date" value={formData.date_of_birth}
                max={todayStr()} onChange={handleChange} onBlur={handleBlur} error={errors.date_of_birth} touched={touched.date_of_birth} />
            </div>
            <div className="field-wrapper">
              <label style={s.label}>Gender</label>
              <select name="gender" value={formData.gender} onChange={handleChange} onBlur={handleBlur} style={s.input}>
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
          </div>
        );

      case 2:
        return (
          <div>
            <StepHeader icon="🏥" title="Professional Information" subtitle="Tell us about your medical expertise and credentials" />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div className="field-wrapper">
                <label style={s.label}>Specialty <span style={{ color: colors.teal }}>*</span></label>
                <select name="specialty" value={formData.specialty} onChange={handleChange} onBlur={handleBlur}
                  style={{ ...s.input, borderColor: touched.specialty && errors.specialty ? colors.error : touched.specialty && !errors.specialty && formData.specialty ? colors.mint : s.input.borderColor }}>
                  <option value="">Select Specialty</option>
                  {SPECIALTIES.map(spec => <option key={spec} value={spec}>{spec}</option>)}
                </select>
                {touched.specialty && errors.specialty && <p style={s.errorMsg}>{errors.specialty}</p>}
              </div>
              <Field label="Sub-Specialty" name="sub_specialty" value={formData.sub_specialty}
                placeholder="e.g., Interventional Cardiology" onChange={handleChange} onBlur={handleBlur}
                error={errors.sub_specialty} touched={touched.sub_specialty} />
            </div>
            <Field label="Medical License Number" required name="medical_license_number" value={formData.medical_license_number}
              placeholder="SLMC-12345" onChange={handleChange} onBlur={handleBlur}
              error={errors.medical_license_number} touched={touched.medical_license_number}
              hint="Format: AUTHORITY-NUMBER (e.g., SLMC-12345)" />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div className="field-wrapper">
                <label style={s.label}>Issuing Authority <span style={{ color: colors.teal }}>*</span></label>
                <select name="license_issuing_authority" value={formData.license_issuing_authority}
                  onChange={handleChange} onBlur={handleBlur}
                  style={{ ...s.input, borderColor: touched.license_issuing_authority && errors.license_issuing_authority ? colors.error : touched.license_issuing_authority && !errors.license_issuing_authority && formData.license_issuing_authority ? colors.mint : s.input.borderColor }}>
                  <option value="">Select Authority</option>
                  {ISSUING_AUTHORITIES.map(auth => <option key={auth} value={auth}>{auth}</option>)}
                </select>
                {touched.license_issuing_authority && errors.license_issuing_authority && <p style={s.errorMsg}>{errors.license_issuing_authority}</p>}
              </div>
              <Field label="Years of Experience" required name="years_of_experience" type="text" value={formData.years_of_experience}
                placeholder="5" onChange={handleChange} onBlur={handleBlur}
                error={errors.years_of_experience} touched={touched.years_of_experience}
                maxLength={2} hint="Numbers only (0–60)" />
            </div>
            <Field label="Hospital / Workplace Name" required name="hospital" value={formData.hospital}
              placeholder="National Hospital of Sri Lanka" onChange={handleChange} onBlur={handleBlur}
              error={errors.hospital} touched={touched.hospital} />
            <div className="field-wrapper">
              <label style={s.label}>Hospital / Workplace Address</label>
              <textarea name="hospital_address" value={formData.hospital_address}
                onChange={handleChange} onBlur={handleBlur}
                placeholder="Full address of your workplace"
                style={{ ...s.input, minHeight: '90px', resize: 'vertical' }} />
            </div>
          </div>
        );

      case 3:
        return (
          <div>
            <StepHeader icon="📄" title="Upload Documents" subtitle="All required verification documents (max 5 MB each)" />
            <div style={{ display: 'grid', gap: '18px' }}>
              <FileUpload label="Profile Photo" name="profile_photo" accept="image/*"
                file={files.profile_photo} onChange={handleFileChange} error={errors.profile_photo} icon="📷" />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px' }}>
                <FileUpload label="ID Card (Front)" name="id_card_front" accept="image/*,application/pdf"
                  file={files.id_card_front} onChange={handleFileChange} error={errors.id_card_front} icon="🪪" />
                <FileUpload label="ID Card (Back)" name="id_card_back" accept="image/*,application/pdf"
                  file={files.id_card_back} onChange={handleFileChange} error={errors.id_card_back} icon="🪪" />
              </div>
              <FileUpload label="Medical License Certificate" name="medical_license" accept="image/*,application/pdf"
                file={files.medical_license} onChange={handleFileChange} error={errors.medical_license} icon="📜" />
              <FileUpload label="Degree Certificate (MBBS, MD, etc.)" name="degree_certificates" accept="image/*,application/pdf"
                file={files.degree_certificates} onChange={handleFileChange} error={errors.degree_certificates} icon="🎓" />
            </div>
          </div>
        );

      case 4:
        return (
          <div>
            <StepHeader icon="✅" title="Review Your Information" subtitle="Please verify all details before submitting your application" />
            <ReviewSection title="Personal Information" data={[
              { label: 'Full Name', value: `Dr. ${formData.first_name} ${formData.last_name}` },
              { label: 'Email', value: formData.email },
              { label: 'Password', value: '••••••••' },
              { label: 'Phone', value: formData.phone },
              { label: 'Date of Birth', value: formData.date_of_birth || 'Not provided' },
              { label: 'Gender', value: formData.gender ? formData.gender.charAt(0).toUpperCase() + formData.gender.slice(1) : 'Not provided' },
            ]} />
            <ReviewSection title="Professional Information" data={[
              { label: 'Specialty', value: formData.specialty },
              { label: 'Sub-Specialty', value: formData.sub_specialty || 'None' },
              { label: 'License Number', value: formData.medical_license_number },
              { label: 'Issuing Authority', value: formData.license_issuing_authority },
              { label: 'Experience', value: `${formData.years_of_experience} years` },
              { label: 'Hospital', value: formData.hospital },
              { label: 'Address', value: formData.hospital_address || 'Not provided' },
            ]} />
            <ReviewSection title="Uploaded Documents" data={[
              { label: 'Profile Photo', value: files.profile_photo?.name || 'Not uploaded', isFile: true },
              { label: 'ID Card (Front)', value: files.id_card_front?.name || 'Not uploaded', isFile: true },
              { label: 'ID Card (Back)', value: files.id_card_back?.name || 'Not uploaded', isFile: true },
              { label: 'Medical License', value: files.medical_license?.name || 'Not uploaded', isFile: true },
              { label: 'Degree Certificate', value: files.degree_certificates?.name || 'Not uploaded', isFile: true },
            ]} />
            <div style={{ background: colors.blush, border: `1.5px solid #f8c8d4`, borderRadius: '14px', padding: '20px', marginTop: '28px' }}>
              <p style={{ color: colors.navy, fontWeight: 600, fontSize: '15px', margin: 0, lineHeight: 1.6 }}>
                ⚠️ By submitting this form, you confirm that all information provided is accurate and authentic. False declarations may result in disqualification.
              </p>
            </div>
          </div>
        );

      default: return null;
    }
  };

  const stepLabels = ['Personal', 'Professional', 'Documents', 'Review'];

  return (
    <>
      <style>{globalStyles}</style>

      {/* Full-page background */}
      <div style={{
        minHeight: '100vh',
        background: `linear-gradient(160deg, ${colors.navy} 0%, #1a6e8a 40%, ${colors.teal} 80%, ${colors.mint} 100%)`,
        padding: '0',
        position: 'relative',
      }}>
        {/* Decorative blobs */}
        <div style={{ position: 'fixed', top: '-80px', right: '-80px', width: '320px', height: '320px', borderRadius: '50%', background: 'rgba(118,200,147,0.12)', pointerEvents: 'none', zIndex: 0 }} />
        <div style={{ position: 'fixed', bottom: '-60px', left: '-60px', width: '260px', height: '260px', borderRadius: '50%', background: 'rgba(255,229,236,0.10)', pointerEvents: 'none', zIndex: 0 }} />

        {/* Page content */}
        <div style={{ maxWidth: '860px', margin: '0 auto', padding: '48px 20px 80px', position: 'relative', zIndex: 1 }}>

          {/* Progress steps */}
          <div style={{ marginBottom: '36px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', position: 'relative' }}>
              {/* connector line */}
              <div style={{ position: 'absolute', top: '22px', left: '12%', right: '12%', height: '3px', background: 'rgba(255,255,255,0.2)', zIndex: 0, borderRadius: '2px' }}>
                <div style={{ height: '100%', width: `${((step - 1) / 3) * 100}%`, background: `linear-gradient(90deg, ${colors.mint}, ${colors.teal})`, borderRadius: '2px', transition: 'width 0.4s ease' }} />
              </div>
              {stepLabels.map((label, i) => {
                const done = step > i + 1;
                const active = step === i + 1;
                return (
                  <div key={label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1 }}>
                    <div className="step-circle" style={{
                      width: '46px', height: '46px', borderRadius: '50%',
                      background: done ? colors.mint : active ? 'white' : 'rgba(255,255,255,0.2)',
                      color: done ? 'white' : active ? colors.navy : 'rgba(255,255,255,0.6)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: done ? '20px' : '18px', fontWeight: 700,
                      boxShadow: active ? `0 0 0 5px rgba(255,255,255,0.25)` : 'none',
                      border: done ? `none` : active ? 'none' : '2px solid rgba(255,255,255,0.3)',
                    }}>
                      {done ? '✓' : i + 1}
                    </div>
                    <div style={{ marginTop: '8px', fontSize: '13px', fontWeight: active ? 700 : 500, color: active ? 'white' : done ? colors.mint : 'rgba(255,255,255,0.55)', textAlign: 'center' }}>
                      {label}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Card */}
          <div style={{ background: 'white', borderRadius: '24px', padding: '48px 48px 40px', boxShadow: '0 24px 64px rgba(24,78,119,0.22)' }}>

            {/* Server errors */}
            {serverErrors.length > 0 && (
              <div style={{ background: colors.errorBg, border: `1.5px solid ${colors.error}`, borderRadius: '14px', padding: '18px 20px', marginBottom: '28px' }}>
                {serverErrors.map((err, i) => (
                  <p key={i} style={{ color: colors.error, margin: '4px 0', fontWeight: 500, fontSize: '15px' }}>⚠️ {err}</p>
                ))}
              </div>
            )}

            <div>
              {renderStep()}

              {/* Navigation buttons */}
              <div style={{ display: 'flex', gap: '14px', marginTop: '44px' }}>
                {step > 1 && (
                  <button type="button" className="btn-secondary" style={{ flex: 1 }} onClick={handlePrevious}>
                    ← Previous
                  </button>
                )}
                {step < 4 ? (
                  <button type="button" className="btn-primary" style={{ flex: step === 1 ? 1 : 2 }} onClick={handleNext}>
                    Continue →
                  </button>
                ) : (
                  <button 
                    type="button" 
                    className="btn-primary" 
                    style={{ flex: 2, background: loading ? '#b0bec5' : `linear-gradient(135deg, ${colors.mint} 0%, ${colors.teal} 100%)` }} 
                    disabled={loading}
                    onClick={handleSubmit}
                  >
                    {loading ? 'Submitting…' : '✓ Submit Registration'}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Step indicator footer */}
          <div style={{ textAlign: 'center', marginTop: '20px', color: 'rgba(255,255,255,0.55)', fontSize: '14px' }}>
            Step {step} of 4
          </div>
        </div>
      </div>
    </>
  );
}

// ── Sub-Components ──────────────────────────────────────────────────

function StepHeader({ icon, title, subtitle }) {
  return (
    <div style={{ marginBottom: '32px', paddingBottom: '24px', borderBottom: `2px solid ${colors.cream}` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '8px' }}>
        <div style={{ width: '46px', height: '46px', borderRadius: '14px', background: colors.cream, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', border: `1px solid #dce8f0` }}>
          {icon}
        </div>
        <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: '30px', color: colors.navy, fontWeight: 400 }}>{title}</h2>
      </div>
      <p style={{ color: colors.gray, fontSize: '16px', marginLeft: '60px' }}>{subtitle}</p>
    </div>
  );
}

function Field({ label, name, type = 'text', value, placeholder, onChange, onBlur, error, touched, hint, successMsg, maxLength, required, max }) {
  const isValid = touched && !error && value;
  return (
    <div className="field-wrapper">
      <label style={s.label}>
        {label} {required && <span style={{ color: colors.teal }}>*</span>}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        placeholder={placeholder}
        onChange={onChange}
        onBlur={onBlur}
        maxLength={maxLength}
        max={max}
        style={{
          ...s.input,
          borderColor: touched && error ? colors.error : isValid ? colors.mint : s.input.borderColor,
          background: touched && error ? '#fff8f8' : isValid ? '#f6fef9' : '#f8fafc',
        }}
      />
      {touched && error && <p style={s.errorMsg}>⚠ {error}</p>}
      {successMsg && <p style={s.successMsg}>{successMsg}</p>}
      {hint && !error && <p style={s.hint}>{hint}</p>}
    </div>
  );
}

function FileUpload({ label, name, accept, file, onChange, error, icon }) {
  return (
    <div className="field-wrapper">
      <label style={s.label}>{label} <span style={{ color: colors.teal }}>*</span></label>
      <div
        className="file-upload-box"
        style={{
          border: `2px dashed ${error ? colors.error : file ? colors.mint : colors.border}`,
          borderRadius: '16px', padding: '24px', textAlign: 'center', cursor: 'pointer',
          background: file ? '#f4fef8' : error ? '#fff8f8' : '#f8fafc',
          transition: 'all 0.2s',
        }}
        onClick={() => document.getElementById(name).click()}
      >
        <input type="file" id={name} name={name} accept={accept} onChange={onChange} style={{ display: 'none' }} />
        <div style={{ fontSize: '36px', marginBottom: '10px' }}>{icon}</div>
        {file ? (
          <div>
            <p style={{ color: colors.mint, fontWeight: 700, margin: '0 0 4px', fontSize: '15px' }}>✓ {file.name}</p>
            <p style={{ color: colors.gray, fontSize: '13px', margin: 0 }}>{(file.size / 1024 / 1024).toFixed(2)} MB · Click to change</p>
          </div>
        ) : (
          <div>
            <p style={{ color: colors.navy, fontWeight: 600, margin: '0 0 4px', fontSize: '15px' }}>Click to upload</p>
            <p style={{ color: colors.gray, fontSize: '13px', margin: 0 }}>JPG, PNG or PDF · Max 5 MB</p>
          </div>
        )}
      </div>
      {error && <p style={s.errorMsg}>⚠ {error}</p>}
    </div>
  );
}

function ReviewSection({ title, data }) {
  return (
    <div style={{ background: colors.cream, borderRadius: '16px', padding: '24px', marginBottom: '18px', border: `1px solid #dce8f0` }}>
      <h3 style={{ fontFamily: "'DM Serif Display', serif", fontSize: '20px', color: colors.navy, fontWeight: 400, marginBottom: '18px' }}>{title}</h3>
      {data.map((item, i) => (
        <div key={i} className="review-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: `1px solid #dce8f0`, gap: '20px' }}>
          <span style={{ color: colors.gray, fontWeight: 500, fontSize: '15px', flexShrink: 0 }}>{item.label}</span>
          <span style={{ color: colors.text, fontWeight: 600, fontSize: '15px', textAlign: 'right', wordBreak: 'break-all' }}>
            {item.isFile && item.value !== 'Not uploaded' ? (
              <span style={{ color: colors.mint }}>✓ {item.value}</span>
            ) : item.value === 'Not uploaded' ? (
              <span style={{ color: '#e53e3e' }}>✗ Not uploaded</span>
            ) : item.value}
          </span>
        </div>
      ))}
    </div>
  );
}

// ── Styles object ──
const s = {
  label: {
    display: 'block', fontSize: '15px', fontWeight: 600,
    color: colors.navy, marginBottom: '8px', letterSpacing: '0.1px',
  },
  input: {
    width: '100%', padding: '14px 18px', borderRadius: '12px',
    fontSize: '16px', borderWidth: '1.5px', borderStyle: 'solid',
    borderColor: colors.border, background: '#f8fafc', outline: 'none',
    boxSizing: 'border-box', transition: 'all 0.2s', fontFamily: "'DM Sans', sans-serif",
    color: colors.text,
  },
  errorMsg: { color: colors.error, fontSize: '13px', marginTop: '6px', fontWeight: 500 },
  successMsg: { color: colors.success, fontSize: '13px', marginTop: '6px', fontWeight: 600 },
  hint: { color: colors.gray, fontSize: '12.5px', marginTop: '5px' },
};