-- Create profiles table for user management
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create vehicles table
CREATE TABLE IF NOT EXISTS public.vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER NOT NULL,
  license_plate TEXT,
  vin TEXT,
  color TEXT,
  mileage INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create maintenance_records table
CREATE TABLE IF NOT EXISTS public.maintenance_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id UUID NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'oil_change', 'tire_rotation', 'brake_service', etc.
  description TEXT,
  cost DECIMAL(10,2),
  mileage INTEGER,
  service_date DATE NOT NULL,
  next_service_date DATE,
  next_service_mileage INTEGER,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_records ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_delete_own" ON public.profiles FOR DELETE USING (auth.uid() = id);

-- Create RLS policies for vehicles
CREATE POLICY "vehicles_select_own" ON public.vehicles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "vehicles_insert_own" ON public.vehicles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "vehicles_update_own" ON public.vehicles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "vehicles_delete_own" ON public.vehicles FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for maintenance_records
CREATE POLICY "maintenance_records_select_own" ON public.maintenance_records FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "maintenance_records_insert_own" ON public.maintenance_records FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "maintenance_records_update_own" ON public.maintenance_records FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "maintenance_records_delete_own" ON public.maintenance_records FOR DELETE USING (auth.uid() = user_id);
