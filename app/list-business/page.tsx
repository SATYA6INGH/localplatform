"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import Link from "next/link";

const SUPABASE_URL = "https://ckuiskbegrlrethnlhzq.supabase.co";
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
    "Apartment Design",
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
    "Building Construction",
    "Civil Work",
    "RCC Work",
    "Brick Work",
    "Plaster Work",
    "Waterproofing",
  ],

  Doctor: [
    "General Consultation",
    "Health Checkup",
    "Fever Treatment",
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
    "South Indian Food",
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
    "Party Makeup",
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
    "Water Tank Installation",
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
    "Drone Photography",
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
    "Competitive Exam Preparation",
    "Maths Coaching",
    "Science Coaching",
    "English Coaching",
    "Online Classes",
    "Test Series",
  ],

  Hotel: [
    "Room Booking",
    "Family Rooms",
    "AC Rooms",
    "Non AC Rooms",
    "Restaurant",
    "Conference Hall",
    "Event Booking",
  ],
};

const CATEGORIES = [
  "Architect",
  "Interior Designer",
  "Construction",
  "Doctor",
  "Dentist",
  "Restaurant",
  "Salon",
  "Electrician",
  "Plumber",
  "Real Estate",
  "Auto Repair",
  "Photographer",
  "Gym",
  "Coaching Institute",
  "Hotel",
  "Other",
];

type AIResult = {
  description?: string;
  short_description?: string;
  subcategory?: string;
  services?: string[];
  seo_keywords?: string[];
  highlights?: string[];
};

export default function ListBusinessPage() {
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [userId, setUserId] = useState("");

  const [businessName, setBusinessName] = useState("");
  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [ownerInput, setOwnerInput] = useState("");

  const [description, setDescription] = useState("");
  const [shortDescription, setShortDescription] = useState("");

  const [services, setServices] = useState<string[]>([]);
  const [customService, setCustomService] = useState("");

  const [address, setAddress] = useState("");
  const [area, setArea] = useState("");
  const [landmark, setLandmark] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");

  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [mapsUrl, setMapsUrl] = useState("");

  const [phone, setPhone] = useState("");

  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");

  const [aiLoading, setAiLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        router.replace("/login");
        return;
      }

      setUserId(session.user.id);
    };

    checkAuth();
  }, [router]);

  const availableServices = useMemo(() => {
    return CATEGORY_SERVICES[category] || [];
  }, [category]);

  const toggleService = (service: string) => {
    setServices((prev) =>
      prev.includes(service)
        ? prev.filter((item) => item !== service)
        : [...prev, service]
    );
  };

  const addCustomService = () => {
    const value = customService.trim();

    if (!value) return;

    if (!services.includes(value)) {
      setServices((prev) => [...prev, value]);
    }

    setCustomService("");
  };

  const generateAIListing = async () => {
    setError("");
    setMessage("");

    if (!businessName.trim()) {
      setError("Pehle Business Name bharo.");
      setStep(1);
      return;
    }

    if (!category) {
      setError("Category select karo.");
      setStep(1);
      return;
    }

    setAiLoading(true);

    try {
      const response = await fetch("/api/ai/business-listing", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          businessName,
          category,
          subcategory,
          city,
          area,
          services,
          ownerInput,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "AI listing generate nahi hui.");
      }

      const data: AIResult = result.data;

      setDescription(data.description || "");
      setShortDescription(data.short_description || "");
      setSubcategory(data.subcategory || "");

      if (Array.isArray(data.services)) {
        setServices(data.services);
      }

      setMessage("AI ne aapki business listing ready kar di.");
      setStep(2);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "AI listing generate nahi ho saki."
      );
    } finally {
      setAiLoading(false);
    }
  };

  const useCurrentLocation = () => {
    setError("");
    setMessage("");

    if (!navigator.geolocation) {
      setError("Aapke browser me location support nahi hai.");
      return;
    }

    setLocationLoading(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        setLatitude(lat);
        setLongitude(lng);

        const url = `https://www.google.com/maps?q=${lat},${lng}`;
        setMapsUrl(url);

        setMessage(
          "Location detect ho gayi. Address details neeche fill/verify kar sakte hain."
        );

        setLocationLoading(false);
      },
      (err) => {
        setLocationLoading(false);

        if (err.code === 1) {
          setError(
            "Location permission denied hai. Browser me location permission Allow karo."
          );
        } else {
          setError("Location detect nahi ho saki.");
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  };

  const handleImage = (file: File | null) => {
    setError("");

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Sirf image file upload karo.");
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
      setError("Login session nahi mila. Dobara login karo.");
      return;
    }

    setSaving(true);

    try {
      let imageUrl = "";

      if (image) {
        const extension = image.name.split(".").pop() || "jpg";

        const filePath = `${userId}/${Date.now()}.${extension}`;

        const { error: uploadError } = await supabase.storage
          .from("business-images")
          .upload(filePath, image, {
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) {
          throw uploadError;
        }

        const { data: publicUrlData } = supabase.storage
          .from("business-images")
          .getPublicUrl(filePath);

        imageUrl = publicUrlData.publicUrl;
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

          seo_keywords: [],
          highlights: [],

          city: city.trim(),
          state: state.trim() || null,
          address: address.trim() || null,
          area: area.trim() || null,
          landmark: landmark.trim() || null,
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

      setMessage("Business successfully listed.");

      setTimeout(() => {
        router.push("/dashboard");
      }, 700);
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

  const nextStep = () => {
    setError("");

    if (step === 1) {
      if (!businessName.trim()) {
        setError("Business Name bharo.");
        return;
      }

      if (!category) {
        setError("Category select karo.");
        return;
      }

      setStep(2);
      return;
    }

    if (step === 2) {
      setStep(3);
      return;
    }

    if (step === 3) {
      setStep(4);
      return;
    }

    if (step === 4) {
      setStep(5);
    }
  };

  const previousStep = () => {
    setError("");
    setStep((prev) => Math.max(1, prev - 1));
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="mb-2 flex items-center gap-2">
            <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">
              AI POWERED
            </span>

            <span className="text-sm text-slate-500">
              Premium Business Listing
            </span>
          </div>

          <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
            Apna Business List Karo
          </h1>

          <p className="mt-2 max-w-2xl text-slate-600">
            Sirf basic information do. AI aapki professional business
            profile automatically prepare karega.
          </p>
        </div>

        {/* Progress */}
        <div className="mb-8 overflow-hidden rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
          <div className="grid grid-cols-5 gap-1">
            {[
              ["1", "Business"],
              ["2", "AI Profile"],
              ["3", "Services"],
              ["4", "Location"],
              ["5", "Publish"],
            ].map(([number, label]) => {
              const active = Number(number) === step;
              const completed = Number(number) < step;

              return (
                <button
                  key={number}
                  onClick={() => {
                    if (Number(number) <= step) {
                      setStep(Number(number));
                    }
                  }}
                  className={`rounded-xl px-2 py-3 text-center transition ${
                    active
                      ? "bg-blue-600 text-white"
                      : completed
                        ? "bg-blue-50 text-blue-700"
                        : "text-slate-400"
                  }`}
                >
                  <div className="text-xs font-bold sm:text-sm">
                    {number}
                  </div>

                  <div className="mt-1 text-[10px] font-semibold sm:text-xs">
                    {label}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {error && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        {message && (
          <div className="mb-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
            {message}
          </div>
        )}

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
          {/* STEP 1 */}
          {step === 1 && (
            <section>
              <div className="mb-7">
                <p className="text-sm font-bold text-blue-600">
                  STEP 1
                </p>

                <h2 className="mt-1 text-2xl font-black text-slate-900">
                  Business ke baare me batayein
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Sirf basic information. Baaki AI sambhal lega.
                </p>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Business Name *
                  </label>

                  <input
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="Example: Sunlight Architects"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Category *
                  </label>

                  <select
                    value={category}
                    onChange={(e) => {
                      setCategory(e.target.value);
                      setServices([]);
                      setSubcategory("");
                    }}
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
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
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Phone Number
                  </label>

                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="9876543210"
                    inputMode="tel"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Aap apne business ke baare me simple language me likhein
                  </label>

                  <textarea
                    value={ownerInput}
                    onChange={(e) => setOwnerInput(e.target.value)}
                    rows={5}
                    placeholder="Example: Hum Lucknow me house planning aur 3D elevation ka kaam karte hain. Residential projects ke liye design aur working drawing provide karte hain."
                    className="w-full resize-none rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />

                  <p className="mt-2 text-xs text-slate-500">
                    Perfect English likhne ki zarurat nahi. Hindi/Hinglish me
                    bhi likh sakte ho.
                  </p>
                </div>
              </div>

              <div className="mt-7 rounded-2xl border border-blue-200 bg-blue-50 p-5">
                <div className="flex gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-xl text-white">
                    ✨
                  </div>

                  <div>
                    <h3 className="font-black text-slate-900">
                      AI Listing Assistant
                    </h3>

                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      AI business category ke according description,
                      subcategory aur relevant services automatically
                      suggest karega.
                    </p>
                  </div>
                </div>

                <button
                  onClick={generateAIListing}
                  disabled={aiLoading}
                  className="mt-5 w-full rounded-xl bg-blue-600 px-5 py-3.5 font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {aiLoading
                    ? "AI Listing Bana Raha Hai..."
                    : "✨ AI Se Meri Listing Banao"}
                </button>
              </div>
            </section>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <section>
              <div className="mb-7">
                <p className="text-sm font-bold text-blue-600">
                  STEP 2
                </p>

                <h2 className="mt-1 text-2xl font-black text-slate-900">
                  AI Profile
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  AI generated content ko publish se pehle edit kar sakte
                  hain.
                </p>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Short Description
                  </label>

                  <input
                    value={shortDescription}
                    onChange={(e) =>
                      setShortDescription(e.target.value)
                    }
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Business Description
                  </label>

                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={9}
                    className="w-full resize-none rounded-xl border border-slate-300 px-4 py-3 leading-7 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Subcategory
                  </label>

                  <input
                    value={subcategory}
                    onChange={(e) => setSubcategory(e.target.value)}
                    placeholder="AI suggested subcategory"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />
                </div>
              </div>
            </section>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <section>
              <div className="mb-7">
                <p className="text-sm font-bold text-blue-600">
                  STEP 3
                </p>

                <h2 className="mt-1 text-2xl font-black text-slate-900">
                  Services
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  AI ke suggested services select/edit kar sakte hain.
                </p>
              </div>

              {availableServices.length > 0 && (
                <div className="mb-7">
                  <h3 className="mb-3 text-sm font-black text-slate-800">
                    Recommended Services
                  </h3>

                  <div className="flex flex-wrap gap-2">
                    {availableServices.map((service) => {
                      const selected = services.includes(service);

                      return (
                        <button
                          key={service}
                          onClick={() => toggleService(service)}
                          className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                            selected
                              ? "border-blue-600 bg-blue-600 text-white"
                              : "border-slate-300 bg-white text-slate-700 hover:border-blue-400"
                          }`}
                        >
                          {selected ? "✓ " : "+ "}
                          {service}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="rounded-2xl bg-slate-50 p-5">
                <h3 className="mb-3 text-sm font-black text-slate-800">
                  Add Your Own Service
                </h3>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <input
                    value={customService}
                    onChange={(e) => setCustomService(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addCustomService();
                      }
                    }}
                    placeholder="Example: 3D Walkthrough"
                    className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-500"
                  />

                  <button
                    onClick={addCustomService}
                    className="rounded-xl bg-slate-900 px-5 py-3 font-bold text-white"
                  >
                    Add
                  </button>
                </div>
              </div>

              {services.length > 0 && (
                <div className="mt-6">
                  <h3 className="mb-3 text-sm font-black text-slate-800">
                    Selected Services ({services.length})
                  </h3>

                  <div className="flex flex-wrap gap-2">
                    {services.map((service) => (
                      <span
                        key={service}
                        className="rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700"
                      >
                        {service}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </section>
          )}

          {/* STEP 4 */}
          {step === 4 && (
            <section>
              <div className="mb-7">
                <p className="text-sm font-bold text-blue-600">
                  STEP 4
                </p>

                <h2 className="mt-1 text-2xl font-black text-slate-900">
                  Business Location
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Customers ko aapka exact business location dikhayega.
                </p>
              </div>

              <button
                onClick={useCurrentLocation}
                disabled={locationLoading}
                className="mb-7 flex w-full items-center justify-center gap-3 rounded-2xl border-2 border-blue-600 bg-blue-50 px-5 py-4 font-black text-blue-700 transition hover:bg-blue-100 disabled:opacity-60"
              >
                <span className="text-xl">📍</span>

                {locationLoading
                  ? "Location Detect Ho Rahi Hai..."
                  : "Use My Current Location"}
              </button>

              {latitude !== null && longitude !== null && (
                <div className="mb-6 rounded-xl border border-green-200 bg-green-50 p-4 text-sm">
                  <p className="font-bold text-green-800">
                    ✓ Location detected
                  </p>

                  <p className="mt-1 text-green-700">
                    Latitude: {latitude.toFixed(6)} | Longitude:{" "}
                    {longitude.toFixed(6)}
                  </p>
                </div>
              )}

              <div className="grid gap-5 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Complete Address
                  </label>

                  <textarea
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    rows={3}
                    placeholder="House/Shop No., Street, Road..."
                    className="w-full resize-none rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Area / Locality
                  </label>

                  <input
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    placeholder="Gomti Nagar"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Landmark
                  </label>

                  <input
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    placeholder="Near..."
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    City *
                  </label>

                  <input
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Lucknow"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    State
                  </label>

                  <input
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="Uttar Pradesh"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Pincode
                  </label>

                  <input
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    placeholder="226010"
                    inputMode="numeric"
                    maxLength={6}
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Google Maps Location
                  </label>

                  <input
                    value={mapsUrl}
                    onChange={(e) => setMapsUrl(e.target.value)}
                    placeholder="Automatically generated"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </section>
          )}

          {/* STEP 5 */}
          {step === 5 && (
            <section>
              <div className="mb-7">
                <p className="text-sm font-bold text-blue-600">
                  STEP 5
                </p>

                <h2 className="mt-1 text-2xl font-black text-slate-900">
                  Photo & Publish
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Final details check karke business publish karo.
                </p>
              </div>

              <div className="mb-7">
                <label className="mb-3 block text-sm font-bold text-slate-700">
                  Business Photo / Logo
                </label>

                <label className="flex min-h-52 cursor-pointer items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 transition hover:border-blue-400">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Business preview"
                      className="h-52 w-full object-cover"
                    />
                  ) : (
                    <div className="text-center">
                      <div className="text-4xl">📷</div>

                      <p className="mt-2 font-bold text-slate-700">
                        Upload Business Photo
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        JPG, PNG • Maximum 5 MB
                      </p>
                    </div>
                  )}

                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) =>
                      handleImage(e.target.files?.[0] || null)
                    }
                  />
                </label>
              </div>

              {/* Preview */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <p className="mb-4 text-xs font-black uppercase tracking-wider text-slate-500">
                  Listing Preview
                </p>

                <h3 className="text-2xl font-black text-slate-900">
                  {businessName || "Business Name"}
                </h3>

                <p className="mt-1 font-semibold text-blue-600">
                  {subcategory || category || "Category"}
                </p>

                {shortDescription && (
                  <p className="mt-4 text-sm font-medium text-slate-700">
                    {shortDescription}
                  </p>
                )}

                {description && (
                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    {description}
                  </p>
                )}

                {services.length > 0 && (
                  <div className="mt-5 flex flex-wrap gap-2">
                    {services.slice(0, 8).map((service) => (
                      <span
                        key={service}
                        className="rounded-full bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-sm"
                      >
                        {service}
                      </span>
                    ))}
                  </div>
                )}

                <div className="mt-5 text-sm text-slate-600">
                  📍 {[area, city, state, pincode]
                    .filter(Boolean)
                    .join(", ")}
                </div>
              </div>

              <div className="mt-6 rounded-2xl border border-green-200 bg-green-50 p-5">
                <p className="font-black text-green-800">
                  ✓ Ready to Publish
                </p>

                <p className="mt-1 text-sm leading-6 text-green-700">
                  Aapki listing LocalPlatform par customers ke liye
                  available ho jayegi.
                </p>
              </div>
            </section>
          )}

          {/* Navigation */}
          <div className="mt-8 flex flex-col-reverse gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:justify-between">
            {step > 1 ? (
              <button
                onClick={previousStep}
                disabled={saving}
                className="rounded-xl border border-slate-300 px-6 py-3 font-bold text-slate-700 hover:bg-slate-50"
              >
                ← Back
              </button>
            ) : (
              <Link
                href="/dashboard"
                className="rounded-xl border border-slate-300 px-6 py-3 text-center font-bold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </Link>
            )}

            {step < 5 ? (
              <button
                onClick={nextStep}
                className="rounded-xl bg-slate-900 px-7 py-3 font-bold text-white hover:bg-slate-800"
              >
                Continue →
              </button>
            ) : (
              <button
                onClick={publishBusiness}
                disabled={saving}
                className="rounded-xl bg-blue-600 px-7 py-3 font-black text-white shadow-lg shadow-blue-200 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving
                  ? "Publishing..."
                  : "🚀 Publish Business"}
              </button>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}