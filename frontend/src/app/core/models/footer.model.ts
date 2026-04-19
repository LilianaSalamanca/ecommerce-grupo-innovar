export interface FooterLink {
  label: string;
  url: string;
}

export interface FooterGroup {
  title: string;
  links: FooterLink[];
}

export interface FooterData {
  companyName: string;
  description: string;
  email: string;
  realEmail: string;
  phone: string;
  location: string;
  linkGroups: FooterGroup[];
}