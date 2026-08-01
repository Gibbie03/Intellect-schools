export type Database = {
  public: {
    Tables: {
      results: {
        Row: {
          id: string;
          student_id: string;
          subject: string;
          score: number;
          grade: string;
          term: string;
          status: 'Pending' | 'Approved' | 'Rejected';
          uploaded_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          subject: string;
          score: number;
          grade: string;
          term: string;
          status?: 'Pending' | 'Approved' | 'Rejected';
          uploaded_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          student_id?: string;
          subject?: string;
          score?: number;
          grade?: string;
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
          created_at: string;
        };
        Insert: {
          id?: string;
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
          created_at?: string;
        };
        Update: {
          id?: string;
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
          created_at?: string;
        };
        Relationships: [];
      };
      news_events: {
        Row: {
          id: string;
          title: string;
          content: string;
          event_date: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          content: string;
          event_date?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
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
          image_url: string;
          caption: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          image_url: string;
          caption?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          image_url?: string;
          caption?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      teachers: {
        Row: {
          id: string;
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
