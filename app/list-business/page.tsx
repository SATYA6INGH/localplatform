"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import Link from "next/link";

const SUPABASE_URL =
  "https://ckuiskbegrlrethnlhzq.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_RnrbgHC56vWK6cSA1hmfkA_VVP74VPL";

const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      storageKey: "localplatform-auth",
    },
  }
);

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

type ListingPlan = "free" | "6_month" | "1_year";

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
    Architect:
      `${cleanName} provides architectural planning and design services in ${cleanCity}. Services may include house plans, floor plans, elevations, working drawings and 3D visualisation for residential and other building projects.`,

    "Interior Designer":
      `${cleanName} provides interior design services in ${cleanCity}. The business can assist customers with home interiors, kitchen design, bedroom design, false ceilings, furniture planning and 3D interior visualisation.`,

    Construction:
      `${cleanName} provides construction and civil work services in ${cleanCity}. Services may include residential construction, commercial construction, renovation, RCC work, brick work, plaster work and waterproofing.`,

    Doctor:
      `${cleanName} provides healthcare consultation services in ${cleanCity}. Customers can contact the business for general consultation and relevant healthcare services.`,

    Dentist:
      `${cleanName} provides dental care services in ${cleanCity}. Services may include dental consultation, teeth cleaning, fillings, root canal treatment, braces and other dental procedures.`,

    Restaurant:
      `${cleanName} is a local food and dining business serving customers in ${cleanCity}. Customers can explore available dining, takeaway, delivery and food services.`,

    Salon:
      `${cleanName} provides salon and personal grooming services in ${cleanCity}, including commonly offered hair, beauty and grooming services.`,

    Electrician:
      `${cleanName} provides electrical services in ${cleanCity}, including electrical repair, installation, wiring and maintenance services.`,

    Plumber:
      `${cleanName} provides plumbing services in ${cleanCity}, including repair, installation, leakage and plumbing maintenance work.`,

    "Real Estate":
      `${cleanName} provides real estate services in ${cleanCity}, helping customers with property-related requirements such as sale, purchase and rental.`,

    "Auto Repair":
      `${cleanName} provides vehicle repair and maintenance services in ${cleanCity}. Customers can contact the business for servicing, repair and common automotive maintenance.`,

    Photographer:
      `${cleanName} provides photography and visual media services in ${cleanCity}, covering events, portraits, weddings and other photography requirements.`,

    Gym:
      `${cleanName} provides fitness and training services in ${cleanCity}, helping customers with fitness, strength training and personal training requirements.`,

    "Coaching Institute":
      `${cleanName} provides educational coaching and learning support in ${cleanCity}, with services for students and competitive examination preparation.`,

    Hotel:
      `${cleanName} provides accommodation and hospitality services in ${cleanCity}, with options for rooms, stays and related hospitality requirements.`,

    Other:
      `${cleanName} provides ${category.toLowerCase()} services in ${cleanCity}. Customers can contact the business for its available products and services.`,
  };

  const baseDescription =
    descriptions[category] ||
    `${cleanName} provides ${category.toLowerCase()} services in ${cleanCity}.`;

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
    shortDescription:
      `${cleanName} - ${category} services in ${cleanCity}.`,
    subcategory:
      subcategoryMap[category] || category,
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

  const [latitude, setLatitude] =
    useState<number | null>(null);

  const [longitude, setLongitude] =
    useState<number | null>(null);

  const [phone, setPhone] = useState("");

  const [image, setImage] =
    useState<File | null>(null);

  const [imagePreview, setImagePreview] =
    useState("");

  const [listingPlan, setListingPlan] =
    useState<ListingPlan>("free");

  const [generating, setGenerating] =
    useState(false);

  const [locationLoading, setLocationLoading] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function checkUser() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        router.replace("/login");
        return;
      }

      setUserId(session.user.id);
    }

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
      setShortDescription(
        result.shortDescription
      );
      setSubcategory(result.subcategory);
      setServices(result.services);
      setSeoKeywords(result.keywords);
      setHighlights(result.highlights);

      setGenerating(false);
      setMessage(
        "✓ Aapki listing automatically ready ho gayi."
      );

      setStep(2);
    }, 500);
  };

  const detectLocation = () => {
    setError("");
    setMessage("");

    if (!navigator.geolocation) {
      setError(
        "Browser location support nahi karta."
      );
      return;
    }

    setLocationLoading(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat =
          position.coords.latitude;

        const lng =
          position.coords.longitude;

        setLatitude(lat);
        setLongitude(lng);

        setMapsUrl(
          `https://www.google.com/maps?q=${lat},${lng}`
        );

        setMessage(
          "✓ Current location detect ho gayi."
        );

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

  const handleImage = (
    file: File | undefined
  ) => {
    if (!file) return;

    setError("");

    if (!file.type.startsWith("image/")) {
      setError("Sirf image upload karo.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError(
        "Image maximum 5 MB ki honi chahiye."
      );
      return;
    }

    setImage(file);

    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }

    setImagePreview(
      URL.createObjectURL(file)
    );
  };

  const validateStep = (
    targetStep: number
  ) => {
    setError("");

    if (
      targetStep >= 2 &&
      !businessName.trim()
    ) {
      setError(
        "Business Name required hai."
      );
      setStep(1);
      return false;
    }

    if (
      targetStep >= 2 &&
      !category
    ) {
      setError(
        "Category required hai."
      );
      setStep(1);
      return false;
    }

    if (
      targetStep >= 4 &&
      !city.trim()
    ) {
      setError("City required hai.");
      setStep(4);
      return false;
    }

    return true;
  };

  const goNext = () => {
    if (!validateStep(step + 1)) {
      return;
    }

    if (
      step === 1 &&
      !description
    ) {
      generateListing();
      return;
    }

    setStep((old) =>
      Math.min(5, old + 1)
    );
  };

  const publishBusiness = async () => {
    setError("");
    setMessage("");

    if (!businessName.trim()) {
      setError(
        "Business Name required hai."
      );
      setStep(1);
      return;
    }

    if (!category) {
      setError(
        "Category required hai."
      );
      setStep(1);
      return;
    }

    if (!city.trim()) {
      setError("City required hai.");
      setStep(4);
      return;
    }

    if (!userId) {
      setError(
        "Login session nahi mila."
      );
      return;
    }

    /*
      ABHI PAYMENT INTEGRATION NAHI HAI.

      Free plan directly publish hoga.
      ₹49 / ₹99 plan next payment step me
      Razorpay UPI ke through activate hoga.
    */

    if (listingPlan !== "free") {
      setError(
        "₹49 / ₹99 plan ke liye secure UPI payment next step me activate hoga. Abhi Free plan select karke listing publish karo."
      );
      return;
    }

    setSaving(true);

    try {
      let imageUrl = "";

      if (image) {
        const extension =
          image.name.split(".").pop() ||
          "jpg";

        const path =
          `${userId}/${Date.now()}.${extension}`;

        const {
          error: uploadError,
        } = await supabase.storage
          .from("business-images")
          .upload(path, image);

        if (uploadError) {
          throw uploadError;
        }

        const { data } =
          supabase.storage
            .from("business-images")
            .getPublicUrl(path);

        imageUrl = data.publicUrl;
      }

      const startedAt =
        new Date();

      const expiresAt =
        new Date(startedAt);

      expiresAt.setMonth(
        expiresAt.getMonth() + 3
      );

      const {
        error: insertError,
      } = await supabase
        .from("businesses")
        .insert({
          business_name:
            businessName.trim(),

          category:
            category.trim(),

          subcategory:
            subcategory.trim() ||
            null,

          services,

          description:
            description.trim() ||
            null,

          short_description:
            shortDescription.trim() ||
            null,

          seo_keywords:
            seoKeywords,

          highlights,

          address:
            address.trim() ||
            null,

          area:
            area.trim() ||
            null,

          landmark:
            landmark.trim() ||
            null,

          city:
            city.trim(),

          state:
            state.trim() ||
            null,

          pincode:
            pincode.trim() ||
            null,

          latitude,
          longitude,

          maps_url:
            mapsUrl.trim() ||
            null,

          phone:
            phone.trim() ||
            null,

          owner_id:
            userId,

          image_url:
            imageUrl ||
            null,

          listing_plan:
            "free",

          listing_status:
            "active",

          listing_started_at:
            startedAt.toISOString(),

          listing_expires_at:
            expiresAt.toISOString(),

          payment_id:
            null,

          payment_order_id:
            null,

          paid_at:
            null,
        });

      if (insertError) {
        throw insertError;
      }

      setMessage(
        "✓ Business successfully listed for 3 months."
      );

      setTimeout(() => {
        router.push("/dashboard");
      }, 1000);
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

  const steps = [
    "Business",
    "Profile",
    "Services",
    "Location",
    "Publish",
  ];

  return (
    <main className="min-h-screen overflow-x-hidden bg-slate-50 text-slate-900">

      {/* HEADER */}

      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex min-h-16 w-full max-w-7xl items-center justify-between gap-3 px-4 sm:min-h-[72px] sm:px-6">

          <Link
            href="/"
            className="shrink-0 text-[21px] font-extrabold tracking-tight sm:text-3xl"
          >
            <span className="text-blue-600">
              Local
            </span>
            <span className="text-orange-500">
              Platform
            </span>
          </Link>

          <div className="flex items-center gap-2">

            <Link
              href="/dashboard"
              className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 sm:px-4 sm:text-sm"
            >
              Dashboard
            </Link>

            <Link
              href="/"
              className="hidden rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-blue-700 sm:block sm:text-sm"
            >
              Home
            </Link>

          </div>
        </div>
      </header>

      {/* INTRO */}

      <section className="bg-gradient-to-br from-blue-700 via-blue-700 to-indigo-800">
        <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-10">

          <div className="max-w-3xl text-white">

            <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-blue-50 sm:text-xs">
              Flexible Listing Plans
            </span>

            <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
              Apna Business List Karo
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-blue-100 sm:text-base">
              Free 3 months se start karo ya
              ₹49 / ₹99 ke longer plans choose karo.
            </p>

          </div>
        </div>
      </section>

      {/* PROGRESS */}

      <section className="mx-auto w-full max-w-7xl px-4 pt-5 sm:px-6 sm:pt-7">

        <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">

          {/* MOBILE */}

          <div className="flex items-center gap-2 sm:hidden">

            {steps.map((item, index) => {

              const number =
                index + 1;

              const active =
                step === number;

              const completed =
                number < step;

              return (
                <div
                  key={item}
                  className="flex min-w-0 flex-1 items-center"
                >

                  <button
                    type="button"
                    disabled={
                      number > step
                    }
                    onClick={() => {
                      if (
                        number <= step
                      ) {
                        setStep(number);
                      }
                    }}
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-extrabold ${
                      active
                        ? "bg-blue-600 text-white"
                        : completed
                          ? "bg-blue-100 text-blue-700"
                          : "bg-slate-100 text-slate-400"
                    }`}
                  >
                    {completed
                      ? "✓"
                      : number}
                  </button>

                  {index <
                    steps.length - 1 && (
                    <div
                      className={`mx-1 h-1 flex-1 rounded-full ${
                        number < step
                          ? "bg-blue-500"
                          : "bg-slate-100"
                      }`}
                    />
                  )}

                </div>
              );
            })}

          </div>

          <div className="mt-2 text-center text-xs font-bold text-slate-600 sm:hidden">
            Step {step} of 5 —{" "}
            {steps[step - 1]}
          </div>

          {/* DESKTOP */}

          <div className="hidden sm:grid sm:grid-cols-5 sm:gap-2">

            {steps.map((item, index) => {

              const number =
                index + 1;

              const active =
                step === number;

              const completed =
                number < step;

              return (
                <button
                  key={item}
                  type="button"
                  disabled={
                    number > step
                  }
                  onClick={() => {
                    if (
                      number <= step
                    ) {
                      setStep(number);
                    }
                  }}
                  className={`rounded-xl px-3 py-3 text-sm font-bold transition ${
                    active
                      ? "bg-blue-600 text-white shadow-sm"
                      : completed
                        ? "bg-blue-50 text-blue-700"
                        : "text-slate-400"
                  }`}
                >
                  {completed
                    ? "✓ "
                    : `${number}. `}
                  {item}
                </button>
              );
            })}

          </div>

        </div>
      </section>

      {/* LISTING PLANS */}

      <section className="mx-auto w-full max-w-7xl px-4 pt-5 sm:px-6">

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">

          <div className="text-center">

            <p className="text-xs font-extrabold uppercase tracking-wider text-blue-600">
              Choose Listing Plan
            </p>

            <h2 className="mt-2 text-2xl font-extrabold sm:text-3xl">
              Apna Business Plan Choose Karo
            </h2>

            <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Free se start karo ya longer visibility
              ke liye one-time paid plan choose karo.
            </p>

          </div>

          <div className="mt-7 grid gap-4 md:grid-cols-3">

            {/* FREE */}

            <button
              type="button"
              onClick={() =>
                setListingPlan("free")
              }
              className={`relative rounded-2xl border-2 p-5 text-left transition ${
                listingPlan === "free"
                  ? "border-blue-600 bg-blue-50 shadow-md"
                  : "border-slate-200 bg-white hover:border-blue-300"
              }`}
            >

              {listingPlan === "free" && (
                <span className="absolute right-4 top-4 rounded-full bg-blue-600 px-2 py-1 text-[10px] font-extrabold text-white">
                  SELECTED
                </span>
              )}

              <p className="text-sm font-extrabold text-slate-500">
                FREE
              </p>

              <p className="mt-2 text-3xl font-black">
                ₹0
              </p>

              <p className="mt-1 text-sm font-bold text-blue-600">
                3 Months
              </p>

              <div className="mt-5 space-y-2 text-sm text-slate-600">
                <p>✓ Business Listing</p>
                <p>✓ Business Profile</p>
                <p>✓ Services & Location</p>
                <p>✓ Search Visibility</p>
              </div>

              <div className="mt-5 rounded-xl bg-blue-600 px-3 py-2 text-center text-xs font-extrabold text-white">
                Start Free
              </div>

            </button>

            {/* 6 MONTH */}

            <button
              type="button"
              onClick={() =>
                setListingPlan("6_month")
              }
              className={`relative rounded-2xl border-2 p-5 text-left transition ${
                listingPlan === "6_month"
                  ? "border-blue-600 bg-blue-50 shadow-md"
                  : "border-slate-200 bg-white hover:border-blue-300"
              }`}
            >

              <span className="absolute right-4 top-4 rounded-full bg-orange-500 px-2 py-1 text-[10px] font-extrabold text-white">
                POPULAR
              </span>

              <p className="text-sm font-extrabold text-slate-500">
                STANDARD
              </p>

              <p className="mt-2 text-3xl font-black">
                ₹49
              </p>

              <p className="mt-1 text-sm font-bold text-blue-600">
                6 Months
              </p>

              <div className="mt-5 space-y-2 text-sm text-slate-600">
                <p>✓ Business Listing</p>
                <p>✓ Business Profile</p>
                <p>✓ Services & Location</p>
                <p>✓ Search Visibility</p>
              </div>

              <div className="mt-5 rounded-xl bg-slate-900 px-3 py-2 text-center text-xs font-extrabold text-white">
                ₹49 One-Time Payment
              </div>

              <p className="mt-2 text-center text-[11px] text-slate-500">
                No subscription • No auto-renewal
              </p>

            </button>

            {/* 1 YEAR */}

            <button
              type="button"
              onClick={() =>
                setListingPlan("1_year")
              }
              className={`relative rounded-2xl border-2 p-5 text-left transition ${
                listingPlan === "1_year"
                  ? "border-blue-600 bg-blue-50 shadow-md"
                  : "border-slate-200 bg-white hover:border-blue-300"
              }`}
            >

              <span className="absolute right-4 top-4 rounded-full bg-emerald-600 px-2 py-1 text-[10px] font-extrabold text-white">
                BEST VALUE
              </span>

              <p className="text-sm font-extrabold text-slate-500">
                PREMIUM
              </p>

              <p className="mt-2 text-3xl font-black">
                ₹99
              </p>

              <p className="mt-1 text-sm font-bold text-blue-600">
                1 Year
              </p>

              <div className="mt-5 space-y-2 text-sm text-slate-600">
                <p>✓ Business Listing</p>
                <p>✓ Business Profile</p>
                <p>✓ Services & Location</p>
                <p>✓ Search Visibility</p>
              </div>

              <div className="mt-5 rounded-xl bg-slate-900 px-3 py-2 text-center text-xs font-extrabold text-white">
                ₹99 One-Time Payment
              </div>

              <p className="mt-2 text-center text-[11px] text-slate-500">
                No subscription • No auto-renewal
              </p>

            </button>

          </div>

          {listingPlan !== "free" && (
            <div className="mt-5 rounded-2xl border border-orange-200 bg-orange-50 p-4 text-center text-sm font-semibold text-orange-800">
              💳 Paid plan selected hai.
              <br />
              Secure UPI payment next step me
              activate hoga.
            </div>
          )}

        </div>
      </section>

      {/* MESSAGES */}

      <section className="mx-auto w-full max-w-7xl px-4 pt-5 sm:px-6">

        {error && (
          <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-semibold leading-6 text-red-700">
            {error}
          </div>
        )}

        {message && (
          <div className="mt-3 rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-sm font-semibold leading-6 text-emerald-700">
            {message}
          </div>
        )}

      </section>

      {/* FORM */}

      <section className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 sm:py-7">

        <div className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">

          {/* MAIN */}

          <div className="min-w-0 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">

            {/* STEP 1 */}

            {step === 1 && (
              <>

                <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
                  Step 1
                </p>

                <h2 className="mt-1 text-2xl font-extrabold sm:text-3xl">
                  Business Information
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Sirf basic details do. Baaki listing
                  automatically prepare hogi.
                </p>

                <div className="mt-7 grid gap-5 sm:grid-cols-2">

                  <div className="sm:col-span-2">
                    <label className="mb-2 block text-sm font-bold">
                      Business Name *
                    </label>

                    <input
                      value={businessName}
                      onChange={(e) =>
                        setBusinessName(
                          e.target.value
                        )
                      }
                      placeholder="Sunlight Architects"
                      className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-bold">
                      Category *
                    </label>

                    <select
                      value={category}
                      onChange={(e) => {
                        setCategory(
                          e.target.value
                        );
                        setServices([]);
                        setSubcategory("");
                        setDescription("");
                        setShortDescription("");
                      }}
                      className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-blue-500"
                    >
                      <option value="">
                        Select Category
                      </option>

                      {CATEGORIES.map(
                        (item) => (
                          <option
                            key={item}
                            value={item}
                          >
                            {item}
                          </option>
                        )
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-bold">
                      Phone
                    </label>

                    <input
                      value={phone}
                      onChange={(e) =>
                        setPhone(
                          e.target.value
                        )
                      }
                      placeholder="9876543210"
                      inputMode="tel"
                      className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="mb-2 block text-sm font-bold">
                      City
                    </label>

                    <input
                      value={city}
                      onChange={(e) =>
                        setCity(
                          e.target.value
                        )
                      }
                      placeholder="Lucknow"
                      className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="mb-2 block text-sm font-bold">
                      Business ke baare me 1-2 line
                    </label>

                    <textarea
                      value={ownerInput}
                      onChange={(e) =>
                        setOwnerInput(
                          e.target.value
                        )
                      }
                      rows={4}
                      placeholder="Hum Lucknow me house planning aur 3D elevation ka kaam karte hain..."
                      className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm leading-6 outline-none focus:border-blue-500"
                    />

                    <p className="mt-2 text-xs text-slate-500">
                      Hindi/Hinglish me bhi likh sakte ho.
                    </p>
                  </div>

                </div>
              </>
            )}

            {/* STEP 2 */}

            {step === 2 && (
              <>

                <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
                  Step 2
                </p>

                <h2 className="mt-1 text-2xl font-extrabold sm:text-3xl">
                  Business Profile
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Automatically generated content ko
                  publish se pehle edit kar sakte ho.
                </p>

                <div className="mt-7 space-y-5">

                  <div>
                    <label className="mb-2 block text-sm font-bold">
                      Short Description
                    </label>

                    <input
                      value={shortDescription}
                      onChange={(e) =>
                        setShortDescription(
                          e.target.value
                        )
                      }
                      className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-bold">
                      Description
                    </label>

                    <textarea
                      value={description}
                      onChange={(e) =>
                        setDescription(
                          e.target.value
                        )
                      }
                      rows={8}
                      className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm leading-7 outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-bold">
                      Subcategory
                    </label>

                    <input
                      value={subcategory}
                      onChange={(e) =>
                        setSubcategory(
                          e.target.value
                        )
                      }
                      className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-blue-500"
                    />
                  </div>

                </div>
              </>
            )}

            {/* STEP 3 */}

            {step === 3 && (
              <>

                <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
                  Step 3
                </p>

                <h2 className="mt-1 text-2xl font-extrabold sm:text-3xl">
                  Services
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Customers ko jo services milti hain,
                  unhe select karo.
                </p>

                {availableServices.length > 0 ? (
                  <div className="mt-7 grid grid-cols-1 gap-2 sm:grid-cols-2">

                    {availableServices.map(
                      (service) => {

                        const selected =
                          services.includes(
                            service
                          );

                        return (
                          <button
                            key={service}
                            type="button"
                            onClick={() =>
                              toggleService(
                                service
                              )
                            }
                            className={`flex min-w-0 items-center gap-3 rounded-xl border p-3 text-left text-sm font-semibold transition ${
                              selected
                                ? "border-blue-600 bg-blue-600 text-white"
                                : "border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:bg-blue-50"
                            }`}
                          >

                            <span
                              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs ${
                                selected
                                  ? "bg-white/20"
                                  : "bg-slate-100"
                              }`}
                            >
                              {selected
                                ? "✓"
                                : "+"}
                            </span>

                            <span className="min-w-0 break-words">
                              {service}
                            </span>

                          </button>
                        );
                      }
                    )}

                  </div>
                ) : (
                  <div className="mt-7 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">

                    <div className="text-3xl">
                      🛠️
                    </div>

                    <p className="mt-2 text-sm font-semibold text-slate-600">
                      Is category ke liye predefined
                      services available nahi hain.
                    </p>

                  </div>
                )}

                <div className="mt-5 rounded-2xl bg-blue-50 p-4 text-sm font-semibold text-blue-800">
                  {services.length} service
                  {services.length === 1
                    ? ""
                    : "s"}{" "}
                  selected
                </div>

              </>
            )}

            {/* STEP 4 */}

            {step === 4 && (
              <>

                <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
                  Step 4
                </p>

                <h2 className="mt-1 text-2xl font-extrabold sm:text-3xl">
                  Business Location
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Address aur location details customers
                  ko business tak pahunchne mein help karengi.
                </p>

                <button
                  type="button"
                  onClick={detectLocation}
                  disabled={locationLoading}
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-blue-600 bg-blue-50 px-5 py-4 text-sm font-extrabold text-blue-700 hover:bg-blue-100 disabled:opacity-60"
                >
                  📍{" "}
                  {locationLoading
                    ? "Location Detect Ho Rahi Hai..."
                    : "Use My Current Location"}
                </button>

                {latitude !== null &&
                  longitude !== null && (
                    <div className="mt-4 rounded-2xl border border-emerald-100 bg-emerald-50 p-4">

                      <p className="text-sm font-bold text-emerald-700">
                        ✓ Location detected
                      </p>

                      <p className="mt-1 text-xs text-emerald-600">
                        {latitude.toFixed(6)},{" "}
                        {longitude.toFixed(6)}
                      </p>

                    </div>
                  )}

                <div className="mt-6 grid gap-4 sm:grid-cols-2">

                  <div className="sm:col-span-2">

                    <label className="mb-2 block text-sm font-bold">
                      Complete Address
                    </label>

                    <textarea
                      value={address}
                      onChange={(e) =>
                        setAddress(
                          e.target.value
                        )
                      }
                      rows={3}
                      placeholder="House / Shop / Office address"
                      className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
                    />

                  </div>

                  <input
                    value={area}
                    onChange={(e) =>
                      setArea(
                        e.target.value
                      )
                    }
                    placeholder="Area / Locality"
                    className="h-12 rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-blue-500"
                  />

                  <input
                    value={landmark}
                    onChange={(e) =>
                      setLandmark(
                        e.target.value
                      )
                    }
                    placeholder="Landmark"
                    className="h-12 rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-blue-500"
                  />

                  <input
                    value={city}
                    onChange={(e) =>
                      setCity(
                        e.target.value
                      )
                    }
                    placeholder="City *"
                    className="h-12 rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-blue-500"
                  />

                  <input
                    value={state}
                    onChange={(e) =>
                      setState(
                        e.target.value
                      )
                    }
                    placeholder="State"
                    className="h-12 rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-blue-500"
                  />

                  <input
                    value={pincode}
                    onChange={(e) =>
                      setPincode(
                        e.target.value.replace(
                          /\D/g,
                          ""
                        )
                      )
                    }
                    placeholder="Pincode"
                    inputMode="numeric"
                    maxLength={6}
                    className="h-12 rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-blue-500"
                  />

                  <input
                    value={mapsUrl}
                    onChange={(e) =>
                      setMapsUrl(
                        e.target.value
                      )
                    }
                    placeholder="Google Maps URL"
                    className="h-12 rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-blue-500"
                  />

                </div>

              </>
            )}

            {/* STEP 5 */}

            {step === 5 && (
              <>

                <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
                  Step 5
                </p>

                <h2 className="mt-1 text-2xl font-extrabold sm:text-3xl">
                  Photo & Publish
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Final preview check karo aur business
                  publish karo.
                </p>

                {/* PHOTO */}

                <label className="mt-7 block cursor-pointer overflow-hidden rounded-3xl border-2 border-dashed border-slate-300 bg-slate-50">

                  {imagePreview ? (
                    <div className="relative">

                      <img
                        src={imagePreview}
                        alt="Business preview"
                        className="h-56 w-full object-cover sm:h-72"
                      />

                      <div className="absolute bottom-3 left-3 rounded-lg bg-black/70 px-3 py-1.5 text-xs font-bold text-white">
                        Change Photo
                      </div>

                    </div>
                  ) : (
                    <div className="flex min-h-56 flex-col items-center justify-center px-5 text-center">

                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 text-3xl">
                        📷
                      </div>

                      <p className="mt-4 font-extrabold">
                        Upload Business Photo
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        JPG / PNG • Maximum 5 MB
                      </p>

                    </div>
                  )}

                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) =>
                      handleImage(
                        e.target.files?.[0]
                      )
                    }
                  />

                </label>

                {/* PREVIEW */}

                <div className="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

                  <div className="bg-gradient-to-br from-blue-700 to-indigo-800 p-5 text-white sm:p-6">

                    <span className="rounded-full bg-white/15 px-3 py-1.5 text-xs font-bold">
                      {category || "Business"}
                    </span>

                    <h3 className="mt-4 break-words text-2xl font-extrabold">
                      {businessName ||
                        "Business Name"}
                    </h3>

                    <p className="mt-2 text-sm text-blue-100">
                      {subcategory ||
                        category}
                    </p>

                    <p className="mt-3 text-sm text-blue-100">
                      📍{" "}
                      {[
                        area,
                        city,
                        state,
                        pincode,
                      ]
                        .filter(Boolean)
                        .join(", ") ||
                        "Location not added"}
                    </p>

                  </div>

                  <div className="p-5 sm:p-6">

                    <h4 className="font-extrabold">
                      About
                    </h4>

                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {description ||
                        "Business description will appear here."}
                    </p>

                    {services.length > 0 && (
                      <>

                        <h4 className="mt-6 font-extrabold">
                          Services
                        </h4>

                        <div className="mt-3 flex flex-wrap gap-2">

                          {services
                            .slice(0, 10)
                            .map(
                              (service) => (
                                <span
                                  key={service}
                                  className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700"
                                >
                                  {service}
                                </span>
                              )
                            )}

                        </div>

                      </>
                    )}

                  </div>
                </div>

                {/* SELECTED PLAN */}

                <div className="mt-6 rounded-2xl border border-blue-200 bg-blue-50 p-5">

                  <p className="text-xs font-extrabold uppercase tracking-wider text-blue-600">
                    Selected Plan
                  </p>

                  <div className="mt-2 flex items-center justify-between gap-3">

                    <div>
                      <p className="font-extrabold text-slate-900">
                        {listingPlan === "free" &&
                          "Free Listing"}

                        {listingPlan === "6_month" &&
                          "Standard Listing"}

                        {listingPlan === "1_year" &&
                          "Premium Listing"}
                      </p>

                      <p className="mt-1 text-sm text-slate-600">
                        {listingPlan === "free" &&
                          "3 Months • ₹0"}

                        {listingPlan === "6_month" &&
                          "6 Months • ₹49"}

                        {listingPlan === "1_year" &&
                          "1 Year • ₹99"}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setListingPlan("free")
                      }
                      className="text-xs font-bold text-blue-700 underline"
                    >
                      Change
                    </button>

                  </div>

                </div>

                <button
                  type="button"
                  onClick={
                    publishBusiness
                  }
                  disabled={saving}
                  className="mt-7 w-full rounded-2xl bg-blue-600 px-5 py-4 text-sm font-extrabold text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 sm:text-base"
                >
                  {saving
                    ? "Publishing..."
                    : listingPlan === "free"
                      ? "🚀 Publish Free Listing"
                      : "💳 Continue to Payment"}
                </button>

              </>
            )}

            {/* NAVIGATION */}

            <div className="mt-8 flex flex-col-reverse gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:items-center sm:justify-between">

              {step > 1 ? (
                <button
                  type="button"
                  onClick={() => {
                    setError("");
                    setMessage("");
                    setStep(
                      (old) =>
                        old - 1
                    );
                  }}
                  className="w-full rounded-xl border border-slate-200 px-6 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 sm:w-auto"
                >
                  ← Back
                </button>
              ) : (
                <Link
                  href="/dashboard"
                  className="w-full rounded-xl border border-slate-200 px-6 py-3 text-center text-sm font-bold text-slate-700 hover:bg-slate-50 sm:w-auto"
                >
                  Cancel
                </Link>
              )}

              {step < 5 && (
                <button
                  type="button"
                  onClick={goNext}
                  disabled={generating}
                  className="w-full rounded-xl bg-slate-900 px-7 py-3 text-sm font-bold text-white hover:bg-slate-800 disabled:opacity-60 sm:w-auto"
                >
                  {generating
                    ? "Preparing..."
                    : step === 1
                      ? "Continue & Prepare Listing →"
                      : "Continue →"}
                </button>
              )}

            </div>

          </div>

          {/* SIDE INFO */}

          <aside className="hidden space-y-4 lg:block">

            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">

              <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
                Listing Guide
              </p>

              <h2 className="mt-1 text-xl font-extrabold">
                Simple & Fast
              </h2>

              <div className="mt-5 space-y-4">

                {steps.map(
                  (item, index) => (
                    <div
                      key={item}
                      className="flex items-start gap-3"
                    >

                      <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-extrabold ${
                          index + 1 <= step
                            ? "bg-blue-600 text-white"
                            : "bg-slate-100 text-slate-400"
                        }`}
                      >
                        {index + 1}
                      </div>

                      <div>

                        <p className="text-sm font-bold">
                          {item}
                        </p>

                        <p className="mt-0.5 text-xs leading-5 text-slate-500">
                          {index === 0 &&
                            "Basic business details"}

                          {index === 1 &&
                            "Automatic profile content"}

                          {index === 2 &&
                            "Choose your services"}

                          {index === 3 &&
                            "Address & location"}

                          {index === 4 &&
                            "Photo, preview & publish"}
                        </p>

                      </div>

                    </div>
                  )
                )}

              </div>
            </div>

            <div className="rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-700 p-6 text-white shadow-lg">

              <div className="text-3xl">
                🚀
              </div>

              <h2 className="mt-3 text-xl font-extrabold">
                Get discovered
              </h2>

              <p className="mt-2 text-sm leading-6 text-blue-100">
                Apni services aur location add karke
                customers ke liye searchable business
                profile banao.
              </p>

            </div>

          </aside>

        </div>
      </section>

      {/* FOOTER */}

      <footer className="mt-5 bg-slate-950 px-4 py-8 text-center text-slate-400 sm:mt-10">

        <div className="text-xl font-extrabold">
          <span className="text-blue-400">
            Local
          </span>
          <span className="text-orange-400">
            Platform
          </span>
        </div>

        <p className="mt-1 text-xs">
          Find. Connect. Grow.
        </p>

        <div className="mt-5 flex flex-wrap justify-center gap-x-5 gap-y-2 text-xs sm:text-sm">

          <Link
            href="/"
            className="hover:text-white"
          >
            Home
          </Link>

          <Link
            href="/search"
            className="hover:text-white"
          >
            Search
          </Link>

          <Link
            href="/dashboard"
            className="hover:text-white"
          >
            Dashboard
          </Link>

        </div>

        <p className="mt-5 text-[10px]">
          © 2026 LocalPlatform. All rights reserved.
        </p>

      </footer>

    </main>
  );
}