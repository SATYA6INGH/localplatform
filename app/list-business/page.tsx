"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import Link from "next/link";

const SUPABASE_URL =
  "https://ckuiskbegrlrethnlhzq.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_RnrbgHC56vWK6cSA1hmfkA_VVP74VPL";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storageKey: "localplatform-auth",
  },
});

const CATEGORY_SERVICES: Record<string, string[]> = {
  Architect: [
    "House Plan",
    "Villa Design",
    "Bungalow Design",
    "Farm House Design",
    "Duplex Design",
    "2D Floor Plan",
    "Building Plan",
    "Working Drawing",
    "Front Elevation",
    "3D Elevation",
    "Structural Drawing",
    "RCC Design",
    "Electrical Drawing",
    "Plumbing Drawing",
    "Landscape Design",
    "Site Planning",
    "3D Rendering",
    "Exterior Rendering",
    "Interior Rendering",
    "3D Walkthrough",
  ],

  "Interior Designer": [
    "Home Interior",
    "Kitchen Design",
    "Bedroom Design",
    "Living Room Design",
    "Office Interior",
    "Modular Kitchen",
    "False Ceiling",
    "Furniture Design",
    "3D Interior Design",
    "Interior Rendering",
  ],

  Construction: [
    "House Construction",
    "Residential Construction",
    "Commercial Construction",
    "Renovation",
    "Civil Work",
    "RCC Work",
    "Brick Work",
    "Plaster Work",
    "Waterproofing",
  ],

  Doctor: [
    "General Consultation",
    "Health Checkup",
    "Diabetes Consultation",
    "Blood Pressure Consultation",
    "Preventive Healthcare",
  ],

  Dentist: [
    "Dental Checkup",
    "Teeth Cleaning",
    "Root Canal Treatment",
    "Dental Filling",
    "Tooth Extraction",
    "Braces",
    "Dental Implant",
  ],

  Restaurant: [
    "Dine In",
    "Takeaway",
    "Home Delivery",
    "North Indian Food",
    "Chinese Food",
    "Fast Food",
    "Vegetarian Food",
    "Party Booking",
  ],

  Salon: [
    "Haircut",
    "Hair Styling",
    "Hair Colour",
    "Facial",
    "Manicure",
    "Pedicure",
    "Bridal Makeup",
    "Hair Spa",
  ],

  Electrician: [
    "House Wiring",
    "Electrical Repair",
    "Fan Installation",
    "Light Installation",
    "Switch Repair",
    "MCB Installation",
    "Inverter Installation",
    "Electrical Maintenance",
  ],

  Plumber: [
    "Pipe Repair",
    "Bathroom Plumbing",
    "Kitchen Plumbing",
    "Tap Repair",
    "Drainage Repair",
    "Leakage Repair",
    "Plumbing Maintenance",
  ],

  "Real Estate": [
    "Property Sale",
    "Property Purchase",
    "Residential Property",
    "Commercial Property",
    "Plot Sale",
    "House Sale",
    "Flat Sale",
    "Property Rental",
  ],

  "Auto Repair": [
    "Car Repair",
    "Bike Repair",
    "General Service",
    "Engine Repair",
    "Brake Repair",
    "AC Repair",
    "Oil Change",
    "Battery Service",
  ],

  Photographer: [
    "Wedding Photography",
    "Pre Wedding Photography",
    "Event Photography",
    "Portrait Photography",
    "Product Photography",
    "Birthday Photography",
    "Video Shooting",
  ],

  Gym: [
    "Gym Training",
    "Personal Training",
    "Weight Training",
    "Cardio Training",
    "Weight Loss",
    "Muscle Building",
    "Fitness Training",
  ],

  "Coaching Institute": [
    "School Coaching",
    "Maths Coaching",
    "Science Coaching",
    "English Coaching",
    "Competitive Exam Preparation",
    "Online Classes",
    "Test Series",
  ],

  Hotel: [
    "Room Booking",
    "Family Rooms",
    "AC Rooms",
    "Restaurant",
    "Conference Hall",
    "Event Booking",
  ],

  Other: [],
};

const CATEGORIES = Object.keys(CATEGORY_SERVICES);

function createAutomaticListing(
  name: string,
  category: string,
  city: string,
  ownerText: string,
  selectedServices: string[]
) {
  const cleanName = name.trim();
  const cleanCity = city.trim() || "your city";

  const services =
    selectedServices.length > 0
      ? selectedServices
      : (CATEGORY_SERVICES[category] || []).slice(0, 8);

  const descriptions: Record<string, string> = {
    Architect: `${cleanName} provides architectural planning and design services in ${cleanCity}. Services may include house plans, floor plans, elevations, working drawings and 3D visualisation for residential and other building projects.`,

    "Interior Designer": `${cleanName} provides interior design services in ${cleanCity}. The business can assist customers with home interiors, kitchen design, bedroom design, false ceilings, furniture planning and 3D interior visualisation.`,

    Construction: `${cleanName} provides construction and civil work services in ${cleanCity}. Services may include residential construction, commercial construction, renovation, RCC work, brick work, plaster work and waterproofing.`,

    Doctor: `${cleanName} provides healthcare consultation services in ${cleanCity}. Customers can contact the business for general consultation and relevant healthcare services.`,

    Dentist: `${cleanName} provides dental care services in ${cleanCity}. Services may include dental consultation, teeth cleaning, fillings, root canal treatment, braces and other dental procedures.`,

    Restaurant: `${cleanName} is a local food and dining business serving customers in ${cleanCity}. Customers can explore available dining, takeaway, delivery and food services.`,

    Salon: `${cleanName} provides salon and personal grooming services in ${cleanCity}, including commonly offered hair, beauty and grooming services.`,

    Electrician: `${cleanName} provides electrical services in ${cleanCity}, including electrical repair, installation, wiring and maintenance services.`,

    Plumber: `${cleanName} provides plumbing services in ${cleanCity}, including repair, installation, leakage and plumbing maintenance work.`,

    "Real Estate": `${cleanName} provides real estate services in ${cleanCity}, helping customers with property-related requirements such as sale, purchase and rental.`,

    "Auto Repair": `${cleanName} provides vehicle repair and maintenance services in ${cleanCity}. Customers can contact the business for servicing, repair and common automotive maintenance.`,

    Photographer: `${cleanName} provides photography and visual media services in ${cleanCity}, covering events, portraits, weddings and other photography requirements.`,

    Gym: `${cleanName} provides fitness and training services in ${cleanCity}, helping customers with fitness, strength training and personal training requirements.`,

    "Coaching Institute": `${cleanName} provides educational coaching and learning support in ${cleanCity}, with services for students and competitive examination preparation.`,

    Hotel: `${cleanName} provides accommodation and hospitality services in ${cleanCity}, with options for rooms, stays and related hospitality requirements.`,

    Other: `${cleanName} provides ${category.toLowerCase()} services in ${cleanCity}. Customers can contact the business for its available products and services.`,
  };

  const baseDescription =
    descriptions[category] ||
    `${cleanName} provides ${category.toLowerCase()} services in ${cleanCity}. Customers can contact the business for its available products and services.`;

  const ownerDescription = ownerText.trim();

  const description = ownerDescription
    ? `${baseDescription} ${ownerDescription}`
    : baseDescription;

  const subcategoryMap: Record<string, string> = {
    Architect: "Architectural Design & Planning",
    "Interior Designer": "Interior Design & Space Planning",
    Construction: "Construction & Civil Work",
    Doctor: "Healthcare Consultation",
    Dentist: "Dental Care",
    Restaurant: "Food & Dining",
    Salon: "Beauty & Grooming",
    Electrician: "Electrical Services",
    Plumber: "Plumbing Services",
    "Real Estate": "Property Services",
    "Auto Repair": "Vehicle Repair & Maintenance",
    Photographer: "Photography Services",
    Gym: "Fitness & Training",
    "Coaching Institute": "Education & Coaching",
    Hotel: "Accommodation & Hospitality",
    Other: category,
  };

  return {
    description,
    shortDescription: `${cleanName} - ${category} services in ${cleanCity}.`,
    subcategory: subcategoryMap[category] || category,
    services,
    keywords: [
      category.toLowerCase(),
      `${category.toLowerCase()} in ${cleanCity.toLowerCase()}`,
      `${category.toLowerCase()} near me`,
      `${category.toLowerCase()} services`,
      `local ${category.toLowerCase()}`,
    ],
    highlights: [
      `Local ${category.toLowerCase()} services`,
      `Serving customers in ${cleanCity}`,
      "Business information available on LocalPlatform",
    ],
  };
}

export default function ListBusinessPage() {
  const router = useRouter();

  const [userId, setUserId] = useState("");
  const [step, setStep] = useState(1);

  const [businessName, setBusinessName] = useState("");
  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [ownerInput, setOwnerInput] = useState("");

  const [description, setDescription] = useState("");
  const [shortDescription, setShortDescription] = useState("");

  const [services, setServices] = useState<string[]>([]);
  const [seoKeywords, setSeoKeywords] = useState<string[]>([]);
  const [highlights, setHighlights] = useState<string[]>([]);

  const [address, setAddress] = useState("");
  const [area, setArea] = useState("");
  const [landmark, setLandmark] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");
  const [mapsUrl, setMapsUrl] = useState("");

  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);

  const [phone, setPhone] = useState("");

  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");

  const [generating, setGenerating] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        router.replace("/login");
        return;
      }

      setUserId(session.user.id);
    };

    checkUser();
  }, [router]);

  const availableServices = useMemo(() => {
    return CATEGORY_SERVICES[category] || [];
  }, [category]);

  const toggleService = (service: string) => {
    setServices((old) =>
      old.includes(service)
        ? old.filter((item) => item !== service)
        : [...old, service]
    );
  };

  const generateListing = () => {
    setError("");
    setMessage("");

    if (!businessName.trim()) {
      setError("Business Name bharo.");
      setStep(1);
      return;
    }

    if (!category) {
      setError("Category select karo.");
      setStep(1);
      return;
    }

    setGenerating(true);

    setTimeout(() => {
      const result = createAutomaticListing(
        businessName,
        category,
        city,
        ownerInput,
        services
      );

      setDescription(result.description);
      setShortDescription(result.shortDescription);
      setSubcategory(result.subcategory);
      setServices(result.services);
      setSeoKeywords(result.keywords);
      setHighlights(result.highlights);

      setGenerating(false);
      setMessage("✓ Aapki listing automatically ready ho gayi.");
      setStep(2);
    }, 500);
  };

  const detectLocation = () => {
    setError("");
    setMessage("");

    if (!navigator.geolocation) {
      setError("Browser location support nahi karta.");
      return;
    }

    setLocationLoading(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        setLatitude(lat);
        setLongitude(lng);
        setMapsUrl(`https://www.google.com/maps?q=${lat},${lng}`);

        setMessage("✓ Current location detect ho gayi.");
        setLocationLoading(false);
      },
      () => {
        setLocationLoading(false);
        setError(
          "Location nahi mili. Browser me Location Permission Allow karo."
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  };

  const handleImage = (file: File | undefined) => {
    if (!file) return;

    setError("");

    if (!file.type.startsWith("image/")) {
      setError("Sirf image upload karo.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image maximum 5 MB ki honi chahiye.");
      return;
    }

    setImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const publishBusiness = async () => {
    setError("");
    setMessage("");

    if (!businessName.trim()) {
      setError("Business Name required hai.");
      setStep(1);
      return;
    }

    if (!category) {
      setError("Category required hai.");
      setStep(1);
      return;
    }

    if (!city.trim()) {
      setError("City required hai.");
      setStep(4);
      return;
    }

    if (!userId) {
      setError("Login session nahi mila.");
      return;
    }

    setSaving(true);

    try {
      let imageUrl = "";

      if (image) {
        const extension = image.name.split(".").pop() || "jpg";
        const path = `${userId}/${Date.now()}.${extension}`;

        const { error: uploadError } = await supabase.storage
          .from("business-images")
          .upload(path, image);

        if (uploadError) {
          throw uploadError;
        }

        const { data } = supabase.storage
          .from("business-images")
          .getPublicUrl(path);

        imageUrl = data.publicUrl;
      }

      const { error: insertError } = await supabase
        .from("businesses")
        .insert({
          business_name: businessName.trim(),
          category: category.trim(),
          subcategory: subcategory.trim() || null,

          services,

          description: description.trim() || null,
          short_description: shortDescription.trim() || null,
          seo_keywords: seoKeywords,
          highlights,

          address: address.trim() || null,
          area: area.trim() || null,
          landmark: landmark.trim() || null,
          city: city.trim(),
          state: state.trim() || null,
          pincode: pincode.trim() || null,

          latitude,
          longitude,
          maps_url: mapsUrl.trim() || null,

          phone: phone.trim() || null,

          owner_id: userId,
          image_url: imageUrl || null,
        });

      if (insertError) {
        throw insertError;
      }

      setMessage("✓ Business successfully listed.");

      setTimeout(() => {
        router.push("/dashboard");
      }, 800);
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Business publish nahi ho saka."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">

        <div className="mb-8">
          <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-black text-blue-700">
            FREE AI ASSISTANT
          </span>

          <h1 className="mt-3 text-3xl font-black text-slate-900 sm:text-4xl">
            Apna Business List Karo
          </h1>

          <p className="mt-2 text-slate-600">
            Kam typing karo — LocalPlatform automatically aapki listing
            prepare karega.
          </p>
        </div>

        <div className="mb-6 grid grid-cols-5 gap-1 rounded-2xl bg-white p-2 shadow-sm">
          {["Business", "Profile", "Services", "Location", "Publish"].map(
            (item, index) => {
              const number = index + 1;

              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => {
                    if (number <= step) {
                      setStep(number);
                    }
                  }}
                  className={`rounded-xl px-2 py-3 text-xs font-bold sm:text-sm ${
                    step === number
                      ? "bg-blue-600 text-white"
                      : number < step
                        ? "bg-blue-50 text-blue-700"
                        : "text-slate-400"
                  }`}
                >
                  {number}. {item}
                </button>
              );
            }
          )}
        </div>

        {error && (
          <div className="mb-5 rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-700">
            {error}
          </div>
        )}

        {message && (
          <div className="mb-5 rounded-xl bg-green-50 p-4 text-sm font-semibold text-green-700">
            {message}
          </div>
        )}

        <div className="rounded-3xl bg-white p-5 shadow-sm sm:p-8">

          {step === 1 && (
            <>
              <h2 className="text-2xl font-black text-slate-900">
                Business Information
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Sirf basic details do.
              </p>

              <div className="mt-7 grid gap-5 md:grid-cols-2">

                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-bold">
                    Business Name *
                  </label>

                  <input
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="Sunlight Architects"
                    className="w-full rounded-xl border px-4 py-3 outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold">
                    Category *
                  </label>

                  <select
                    value={category}
                    onChange={(e) => {
                      setCategory(e.target.value);
                      setServices([]);
                      setSubcategory("");
                    }}
                    className="w-full rounded-xl border bg-white px-4 py-3"
                  >
                    <option value="">Select Category</option>

                    {CATEGORIES.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold">
                    Phone
                  </label>

                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="9876543210"
                    inputMode="tel"
                    className="w-full rounded-xl border px-4 py-3"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold">
                    City
                  </label>

                  <input
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Lucknow"
                    className="w-full rounded-xl border px-4 py-3"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-bold">
                    Business ke baare me 1-2 line
                  </label>

                  <textarea
                    value={ownerInput}
                    onChange={(e) => setOwnerInput(e.target.value)}
                    rows={4}
                    placeholder="Hum Lucknow me house planning aur 3D elevation ka kaam karte hain..."
                    className="w-full resize-none rounded-xl border px-4 py-3"
                  />

                  <p className="mt-2 text-xs text-slate-500">
                    Hindi/Hinglish me bhi likh sakte ho.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={generateListing}
                disabled={generating}
                className="mt-7 w-full rounded-xl bg-blue-600 px-5 py-4 font-black text-white hover:bg-blue-700 disabled:opacity-60"
              >
                {generating
                  ? "Listing Prepare Ho Rahi Hai..."
                  : "✨ Automatically Meri Listing Banao"}
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <h2 className="text-2xl font-black text-slate-900">
                Business Profile
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Content ko publish se pehle edit kar sakte ho.
              </p>

              <div className="mt-6 space-y-5">

                <div>
                  <label className="mb-2 block text-sm font-bold">
                    Short Description
                  </label>

                  <input
                    value={shortDescription}
                    onChange={(e) =>
                      setShortDescription(e.target.value)
                    }
                    className="w-full rounded-xl border px-4 py-3"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold">
                    Description
                  </label>

                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={8}
                    className="w-full resize-none rounded-xl border px-4 py-3 leading-7"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold">
                    Subcategory
                  </label>

                  <input
                    value={subcategory}
                    onChange={(e) => setSubcategory(e.target.value)}
                    className="w-full rounded-xl border px-4 py-3"
                  />
                </div>

              </div>
            </>
          )}

          {step === 3 && (
            <>
              <h2 className="text-2xl font-black text-slate-900">
                Services
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Category ke according services automatically suggest ki gayi
                hain.
              </p>

              <div className="mt-6 flex flex-wrap gap-2">
                {availableServices.map((service) => {
                  const selected = services.includes(service);

                  return (
                    <button
                      key={service}
                      type="button"
                      onClick={() => toggleService(service)}
                      className={`rounded-full border px-4 py-2 text-sm font-semibold ${
                        selected
                          ? "border-blue-600 bg-blue-600 text-white"
                          : "border-slate-300 bg-white text-slate-700"
                      }`}
                    >
                      {selected ? "✓ " : "+ "}
                      {service}
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {step === 4 && (
            <>
              <h2 className="text-2xl font-black text-slate-900">
                Business Location
              </h2>

              <button
                type="button"
                onClick={detectLocation}
                disabled={locationLoading}
                className="mt-6 w-full rounded-2xl border-2 border-blue-600 bg-blue-50 px-5 py-4 font-black text-blue-700 disabled:opacity-60"
              >
                📍{" "}
                {locationLoading
                  ? "Location Detect Ho Rahi Hai..."
                  : "Use My Current Location"}
              </button>

              {latitude !== null && longitude !== null && (
                <div className="mt-4 rounded-xl bg-green-50 p-4 text-sm text-green-700">
                  ✓ Location detected
                  <div className="mt-1 text-xs">
                    {latitude.toFixed(6)}, {longitude.toFixed(6)}
                  </div>
                </div>
              )}

              <div className="mt-6 grid gap-5 md:grid-cols-2">

                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-bold">
                    Complete Address
                  </label>

                  <textarea
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    rows={3}
                    className="w-full resize-none rounded-xl border px-4 py-3"
                  />
                </div>

                <input
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  placeholder="Area / Locality"
                  className="rounded-xl border px-4 py-3"
                />

                <input
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  placeholder="Landmark"
                  className="rounded-xl border px-4 py-3"
                />

                <input
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="City *"
                  className="rounded-xl border px-4 py-3"
                />

                <input
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  placeholder="State"
                  className="rounded-xl border px-4 py-3"
                />

                <input
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  placeholder="Pincode"
                  inputMode="numeric"
                  maxLength={6}
                  className="rounded-xl border px-4 py-3"
                />

                <input
                  value={mapsUrl}
                  onChange={(e) => setMapsUrl(e.target.value)}
                  placeholder="Google Maps Location"
                  className="rounded-xl border px-4 py-3"
                />
              </div>
            </>
          )}

          {step === 5 && (
            <>
              <h2 className="text-2xl font-black text-slate-900">
                Photo & Publish
              </h2>

              <label className="mt-6 flex min-h-52 cursor-pointer items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed bg-slate-50">

                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Business preview"
                    className="h-52 w-full object-cover"
                  />
                ) : (
                  <div className="text-center">
                    <div className="text-4xl">📷</div>

                    <p className="mt-2 font-bold">
                      Upload Business Photo
                    </p>

                    <p className="text-xs text-slate-500">
                      JPG / PNG • Maximum 5 MB
                    </p>
                  </div>
                )}

                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) =>
                    handleImage(e.target.files?.[0])
                  }
                />
              </label>

              <div className="mt-6 rounded-2xl bg-slate-50 p-5">
                <h3 className="text-xl font-black text-slate-900">
                  {businessName}
                </h3>

                <p className="mt-1 font-semibold text-blue-600">
                  {subcategory || category}
                </p>

                <p className="mt-4 text-sm leading-6 text-slate-600">
                  {description}
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  {services.slice(0, 10).map((service) => (
                    <span
                      key={service}
                      className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-700"
                    >
                      {service}
                    </span>
                  ))}
                </div>

                <p className="mt-5 text-sm text-slate-600">
                  📍{" "}
                  {[area, city, state, pincode]
                    .filter(Boolean)
                    .join(", ")}
                </p>
              </div>

              <button
                type="button"
                onClick={publishBusiness}
                disabled={saving}
                className="mt-7 w-full rounded-xl bg-blue-600 px-5 py-4 font-black text-white hover:bg-blue-700 disabled:opacity-60"
              >
                {saving
                  ? "Publishing..."
                  : "🚀 Publish Business"}
              </button>
            </>
          )}

          {step < 5 && (
            <div className="mt-8 flex justify-between border-t pt-6">

              {step > 1 ? (
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="rounded-xl border px-6 py-3 font-bold text-slate-700"
                >
                  ← Back
                </button>
              ) : (
                <Link
                  href="/dashboard"
                  className="rounded-xl border px-6 py-3 font-bold text-slate-700"
                >
                  Cancel
                </Link>
              )}

              <button
                type="button"
                onClick={() => setStep(step + 1)}
                className="rounded-xl bg-slate-900 px-7 py-3 font-bold text-white"
              >
                Continue →
              </button>
            </div>
          )}

        </div>
      </div>
    </main>
  );
}