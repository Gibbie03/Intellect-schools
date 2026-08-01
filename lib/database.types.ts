export type Database = {
  public: {
    Tables: {
      schools: {
        Row: {
          id: string;
          name: string;
          subdomain: string;
          custom_domain: string | null;
          id_prefix: string;
          logo_url: string | null;
          primary_color: string | null;
          contact_email: string | null;
          contact_phone: string | null;
          address: string | null;
          status: 'Active' | 'Suspended';
          plan: string;
          features: Record<string, boolean>;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          subdomain: string;
          custom_domain?: string | null;
          id_prefix: string;
          logo_url?: string | null;
          primary_color?: string | null;
          contact_email?: string | null;
          contact_phone?: string | null;
          address?: string | null;
          status?: 'Active' | 'Suspended';
          plan?: string;
          features?: Record<string, boolean>;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          subdomain?: string;
          custom_domain?: string | null;
          id_prefix?: string;
          logo_url?: string | null;
          primary_color?: string | null;
          contact_email?: string | null;
          contact_phone?: string | null;
          address?: string | null;
          status?: 'Active' | 'Suspended';
          plan?: string;
          features?: Record<string, boolean>;
          created_at?: string;
        };
        Relationships: [];
      };
      school_users: {
        Row: {
          id: string;
          school_id: string;
          email: string;
          password_hash: string;
          role: 'admin' | 'teacher';
          full_name: string;
          teacher_id: string | null;
          status: 'Active' | 'Inactive';
          created_at: string;
        };
        Insert: {
          id?: string;
          school_id: string;
          email: string;
          password_hash: string;
          role: 'admin' | 'teacher';
          full_name: string;
          teacher_id?: string | null;
          status?: 'Active' | 'Inactive';
          created_at?: string;
        };
        Update: {
          id?: string;
          school_id?: string;
          email?: string;
          password_hash?: string;
          role?: 'admin' | 'teacher';
          full_name?: string;
          teacher_id?: string | null;
          status?: 'Active' | 'Inactive';
          created_at?: string;
        };
        Relationships: [];
      };
      results: {
        Row: {
          id: string;
          school_id: string;
          student_id: string;
          subject: string;
          score: number;
          grade: string;
          session: string;
          term: string;
          status: 'Pending' | 'Approved' | 'Rejected';
          uploaded_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          school_id: string;
          student_id: string;
          subject: string;
          score: number;
          grade: string;
          session: string;
          term: string;
          status?: 'Pending' | 'Approved' | 'Rejected';
          uploaded_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          school_id?: string;
          student_id?: string;
          subject?: string;
          score?: number;
          grade?: string;
          session?: string;
          term?: string;
          status?: 'Pending' | 'Approved' | 'Rejected';
          uploaded_by?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      admissions: {
        Row: {
          id: string;
          school_id: string;
          student_name: string;
          date_of_birth: string | null;
          gender: string | null;
          class_applying_for: string;
          parent_name: string;
          parent_email: string;
          parent_phone: string;
          address: string | null;
          notes: string | null;
          status: 'Pending' | 'Reviewed' | 'Accepted' | 'Rejected';
          student_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          school_id: string;
          student_name: string;
          date_of_birth?: string | null;
          gender?: string | null;
          class_applying_for: string;
          parent_name: string;
          parent_email: string;
          parent_phone: string;
          address?: string | null;
          notes?: string | null;
          status?: 'Pending' | 'Reviewed' | 'Accepted' | 'Rejected';
          student_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          school_id?: string;
          student_name?: string;
          date_of_birth?: string | null;
          gender?: string | null;
          class_applying_for?: string;
          parent_name?: string;
          parent_email?: string;
          parent_phone?: string;
          address?: string | null;
          notes?: string | null;
          status?: 'Pending' | 'Reviewed' | 'Accepted' | 'Rejected';
          student_id?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      news_events: {
        Row: {
          id: string;
          school_id: string;
          title: string;
          content: string;
          event_date: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          school_id: string;
          title: string;
          content: string;
          event_date?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          school_id?: string;
          title?: string;
          content?: string;
          event_date?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      gallery_images: {
        Row: {
          id: string;
          school_id: string;
          image_url: string;
          caption: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          school_id: string;
          image_url: string;
          caption?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          school_id?: string;
          image_url?: string;
          caption?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      teachers: {
        Row: {
          id: string;
          school_id: string;
          staff_id: string;
          full_name: string;
          role: 'Teacher' | 'Head Teacher' | 'Admin' | 'Bursar' | 'Non-Teaching Staff';
          subject: string | null;
          email: string | null;
          phone: string | null;
          status: 'Active' | 'Inactive';
          created_at: string;
        };
        Insert: {
          id?: string;
          school_id: string;
          staff_id: string;
          full_name: string;
          role?: 'Teacher' | 'Head Teacher' | 'Admin' | 'Bursar' | 'Non-Teaching Staff';
          subject?: string | null;
          email?: string | null;
          phone?: string | null;
          status?: 'Active' | 'Inactive';
          created_at?: string;
        };
        Update: {
          id?: string;
          school_id?: string;
          staff_id?: string;
          full_name?: string;
          role?: 'Teacher' | 'Head Teacher' | 'Admin' | 'Bursar' | 'Non-Teaching Staff';
          subject?: string | null;
          email?: string | null;
          phone?: string | null;
          status?: 'Active' | 'Inactive';
          created_at?: string;
        };
        Relationships: [];
      };
      students: {
        Row: {
          id: string;
          school_id: string;
          student_id: string;
          full_name: string;
          class: string;
          gender: string | null;
          date_of_birth: string | null;
          parent_name: string | null;
          parent_email: string | null;
          parent_phone: string | null;
          address: string | null;
          status: 'Active' | 'Inactive';
          created_at: string;
        };
        Insert: {
          id?: string;
          school_id: string;
          student_id: string;
          full_name: string;
          class: string;
          gender?: string | null;
          date_of_birth?: string | null;
          parent_name?: string | null;
          parent_email?: string | null;
          parent_phone?: string | null;
          address?: string | null;
          status?: 'Active' | 'Inactive';
          created_at?: string;
        };
        Update: {
          id?: string;
          school_id?: string;
          student_id?: string;
          full_name?: string;
          class?: string;
          gender?: string | null;
          date_of_birth?: string | null;
          parent_name?: string | null;
          parent_email?: string | null;
          parent_phone?: string | null;
          address?: string | null;
          status?: 'Active' | 'Inactive';
          created_at?: string;
        };
        Relationships: [];
      };
      contact_messages: {
        Row: {
          id: string;
          school_id: string;
          name: string;
          email: string;
          phone: string | null;
          subject: string | null;
          message: string;
          status: 'New' | 'Read';
          created_at: string;
        };
        Insert: {
          id?: string;
          school_id: string;
          name: string;
          email: string;
          phone?: string | null;
          subject?: string | null;
          message: string;
          status?: 'New' | 'Read';
          created_at?: string;
        };
        Update: {
          id?: string;
          school_id?: string;
          name?: string;
          email?: string;
          phone?: string | null;
          subject?: string | null;
          message?: string;
          status?: 'New' | 'Read';
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
};
