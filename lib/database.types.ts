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
          hero_image_url: string | null;
          tagline: string | null;
          motto: string | null;
          primary_color: string | null;
          secondary_color: string | null;
          contact_email: string | null;
          contact_phone: string | null;
          address: string | null;
          whatsapp_number: string | null;
          principal_welcome_message: string | null;
          principal_photo_url: string | null;
          prospectus_url: string | null;
          campuses: string | null;
          template: string;
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
          hero_image_url?: string | null;
          tagline?: string | null;
          motto?: string | null;
          primary_color?: string | null;
          secondary_color?: string | null;
          contact_email?: string | null;
          contact_phone?: string | null;
          address?: string | null;
          whatsapp_number?: string | null;
          principal_welcome_message?: string | null;
          principal_photo_url?: string | null;
          prospectus_url?: string | null;
          campuses?: string | null;
          template?: string;
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
          hero_image_url?: string | null;
          tagline?: string | null;
          motto?: string | null;
          primary_color?: string | null;
          secondary_color?: string | null;
          contact_email?: string | null;
          contact_phone?: string | null;
          address?: string | null;
          whatsapp_number?: string | null;
          principal_welcome_message?: string | null;
          principal_photo_url?: string | null;
          prospectus_url?: string | null;
          campuses?: string | null;
          template?: string;
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
          totp_secret: string | null;
          totp_enabled: boolean;
          totp_last_used_step: number | null;
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
          totp_secret?: string | null;
          totp_enabled?: boolean;
          totp_last_used_step?: number | null;
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
          totp_secret?: string | null;
          totp_enabled?: boolean;
          totp_last_used_step?: number | null;
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
          ca_score: number | null;
          exam_score: number | null;
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
          ca_score?: number | null;
          exam_score?: number | null;
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
          ca_score?: number | null;
          exam_score?: number | null;
          grade?: string;
          session?: string;
          term?: string;
          status?: 'Pending' | 'Approved' | 'Rejected';
          uploaded_by?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      report_cards: {
        Row: {
          id: string;
          school_id: string;
          student_id: string;
          session: string;
          term: string;
          days_school_opened: number | null;
          days_present: number | null;
          times_punctual: number | null;
          conduct_rating: 'Excellent' | 'Very Good' | 'Good' | 'Fair' | 'Poor' | null;
          teacher_comment: string | null;
          principal_comment: string | null;
          status: 'Draft' | 'Published';
          published_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          school_id: string;
          student_id: string;
          session: string;
          term: string;
          days_school_opened?: number | null;
          days_present?: number | null;
          times_punctual?: number | null;
          conduct_rating?: 'Excellent' | 'Very Good' | 'Good' | 'Fair' | 'Poor' | null;
          teacher_comment?: string | null;
          principal_comment?: string | null;
          status?: 'Draft' | 'Published';
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          school_id?: string;
          student_id?: string;
          session?: string;
          term?: string;
          days_school_opened?: number | null;
          days_present?: number | null;
          times_punctual?: number | null;
          conduct_rating?: 'Excellent' | 'Very Good' | 'Good' | 'Fair' | 'Poor' | null;
          teacher_comment?: string | null;
          principal_comment?: string | null;
          status?: 'Draft' | 'Published';
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
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
          campus: string | null;
          subject: string | null;
          email: string | null;
          phone: string | null;
          status: 'Active' | 'Inactive';
          class_teacher_of: string | null;
          photo_url: string | null;
          bio: string | null;
          show_on_site: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          school_id: string;
          staff_id: string;
          full_name: string;
          role?: 'Teacher' | 'Head Teacher' | 'Admin' | 'Bursar' | 'Non-Teaching Staff';
          campus?: string | null;
          subject?: string | null;
          email?: string | null;
          phone?: string | null;
          status?: 'Active' | 'Inactive';
          class_teacher_of?: string | null;
          photo_url?: string | null;
          bio?: string | null;
          show_on_site?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          school_id?: string;
          staff_id?: string;
          full_name?: string;
          role?: 'Teacher' | 'Head Teacher' | 'Admin' | 'Bursar' | 'Non-Teaching Staff';
          campus?: string | null;
          subject?: string | null;
          email?: string | null;
          phone?: string | null;
          status?: 'Active' | 'Inactive';
          class_teacher_of?: string | null;
          photo_url?: string | null;
          bio?: string | null;
          show_on_site?: boolean;
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
          department: string | null;
          campus: string | null;
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
          department?: string | null;
          campus?: string | null;
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
          department?: string | null;
          campus?: string | null;
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
          category: 'General Enquiry' | 'Suggestion' | 'Complaint' | 'Other';
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
          category?: 'General Enquiry' | 'Suggestion' | 'Complaint' | 'Other';
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
          category?: 'General Enquiry' | 'Suggestion' | 'Complaint' | 'Other';
          created_at?: string;
        };
        Relationships: [];
      };
      result_pins: {
        Row: {
          id: string;
          school_id: string;
          batch_label: string;
          serial: string;
          pin_hash: string;
          session: string;
          term: string | null;
          delivery_method: 'print' | 'digital';
          max_uses: number;
          uses_count: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          school_id: string;
          batch_label: string;
          serial: string;
          pin_hash: string;
          session: string;
          term?: string | null;
          delivery_method?: 'print' | 'digital';
          max_uses?: number;
          uses_count?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          school_id?: string;
          batch_label?: string;
          serial?: string;
          pin_hash?: string;
          session?: string;
          term?: string | null;
          delivery_method?: 'print' | 'digital';
          max_uses?: number;
          uses_count?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      class_timetables: {
        Row: {
          id: string;
          school_id: string;
          class: string;
          day_of_week: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday';
          period_number: number;
          start_time: string | null;
          end_time: string | null;
          subject: string;
          teacher_name: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          school_id: string;
          class: string;
          day_of_week: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday';
          period_number: number;
          start_time?: string | null;
          end_time?: string | null;
          subject: string;
          teacher_name?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          school_id?: string;
          class?: string;
          day_of_week?: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday';
          period_number?: number;
          start_time?: string | null;
          end_time?: string | null;
          subject?: string;
          teacher_name?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      exam_timetables: {
        Row: {
          id: string;
          school_id: string;
          class: string;
          session: string;
          term: string;
          subject: string;
          exam_date: string;
          start_time: string | null;
          end_time: string | null;
          venue: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          school_id: string;
          class: string;
          session: string;
          term: string;
          subject: string;
          exam_date: string;
          start_time?: string | null;
          end_time?: string | null;
          venue?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          school_id?: string;
          class?: string;
          session?: string;
          term?: string;
          subject?: string;
          exam_date?: string;
          start_time?: string | null;
          end_time?: string | null;
          venue?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      fees: {
        Row: {
          id: string;
          school_id: string;
          student_id: string;
          session: string;
          term: string;
          description: string;
          amount: number;
          due_date: string | null;
          status: 'Unpaid' | 'Paid';
          last_reminded_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          school_id: string;
          student_id: string;
          session: string;
          term: string;
          description?: string;
          amount: number;
          due_date?: string | null;
          status?: 'Unpaid' | 'Paid';
          last_reminded_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          school_id?: string;
          student_id?: string;
          session?: string;
          term?: string;
          description?: string;
          amount?: number;
          due_date?: string | null;
          status?: 'Unpaid' | 'Paid';
          last_reminded_at?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      spotlights: {
        Row: {
          id: string;
          school_id: string;
          name: string;
          subtitle: string | null;
          photo_url: string | null;
          blurb: string | null;
          period_label: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          school_id: string;
          name: string;
          subtitle?: string | null;
          photo_url?: string | null;
          blurb?: string | null;
          period_label?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          school_id?: string;
          name?: string;
          subtitle?: string | null;
          photo_url?: string | null;
          blurb?: string | null;
          period_label?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      academic_calendar: {
        Row: {
          id: string;
          school_id: string;
          session: string;
          term: string | null;
          title: string;
          event_type: 'Resumption' | 'Midterm Break' | 'Closing' | 'Holiday' | 'Other';
          start_date: string;
          end_date: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          school_id: string;
          session: string;
          term?: string | null;
          title: string;
          event_type: 'Resumption' | 'Midterm Break' | 'Closing' | 'Holiday' | 'Other';
          start_date: string;
          end_date?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          school_id?: string;
          session?: string;
          term?: string | null;
          title?: string;
          event_type?: 'Resumption' | 'Midterm Break' | 'Closing' | 'Holiday' | 'Other';
          start_date?: string;
          end_date?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      audit_log: {
        Row: {
          id: string;
          school_id: string;
          actor_user_id: string | null;
          actor_name: string;
          actor_role: string;
          action: string;
          entity_type: string;
          entity_id: string | null;
          before: Record<string, unknown> | null;
          after: Record<string, unknown> | null;
          ip_address: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          school_id: string;
          actor_user_id?: string | null;
          actor_name: string;
          actor_role: string;
          action: string;
          entity_type: string;
          entity_id?: string | null;
          before?: Record<string, unknown> | null;
          after?: Record<string, unknown> | null;
          ip_address?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          school_id?: string;
          actor_user_id?: string | null;
          actor_name?: string;
          actor_role?: string;
          action?: string;
          entity_type?: string;
          entity_id?: string | null;
          before?: Record<string, unknown> | null;
          after?: Record<string, unknown> | null;
          ip_address?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      testimonials: {
        Row: {
          id: string;
          school_id: string;
          author_name: string;
          author_role: string | null;
          quote: string;
          photo_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          school_id: string;
          author_name: string;
          author_role?: string | null;
          quote: string;
          photo_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          school_id?: string;
          author_name?: string;
          author_role?: string | null;
          quote?: string;
          photo_url?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      attendance: {
        Row: {
          id: string;
          school_id: string;
          student_id: string;
          class: string;
          session: string;
          term: string;
          date: string;
          status: 'Present' | 'Absent' | 'Late';
          created_at: string;
        };
        Insert: {
          id?: string;
          school_id: string;
          student_id: string;
          class: string;
          session: string;
          term: string;
          date: string;
          status: 'Present' | 'Absent' | 'Late';
          created_at?: string;
        };
        Update: {
          id?: string;
          school_id?: string;
          student_id?: string;
          class?: string;
          session?: string;
          term?: string;
          date?: string;
          status?: 'Present' | 'Absent' | 'Late';
          created_at?: string;
        };
        Relationships: [];
      };
      rate_limit_hits: {
        Row: {
          key: string;
          window_start: string;
          count: number;
        };
        Insert: {
          key: string;
          window_start: string;
          count?: number;
        };
        Update: {
          key?: string;
          window_start?: string;
          count?: number;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      increment_rate_limit: {
        Args: { p_key: string; p_window_start: string };
        Returns: number;
      };
    };
  };
};
