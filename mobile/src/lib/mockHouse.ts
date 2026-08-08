/** Local mock house data — works with zero cloud / zero Linux host. */

export type Reservation = {
  id: string;
  time: string;
  name: string;
  party: number;
  notes?: string;
  status: "booked" | "seated" | "no_show" | "cancelled";
};

export type MenuItem = {
  id: string;
  name: string;
  category: string;
  price: number;
  eightySixed: boolean;
};

export type Ticket = {
  id: string;
  table: string;
  items: string[];
  status: "open" | "fired" | "closed";
};

export type StaffShift = {
  id: string;
  name: string;
  role: string;
  when: string;
};

export const houseName = "Casa Rustico";

export const mockReservations: Reservation[] = [
  {
    id: "r1",
    time: "5:30 PM",
    name: "Martinez",
    party: 4,
    notes: "Anniversary — window if possible",
    status: "booked",
  },
  {
    id: "r2",
    time: "6:00 PM",
    name: "Chen",
    party: 2,
    status: "booked",
  },
  {
    id: "r3",
    time: "6:45 PM",
    name: "Okafor",
    party: 6,
    notes: "High chair",
    status: "booked",
  },
  {
    id: "r4",
    time: "7:15 PM",
    name: "Rossi",
    party: 3,
    status: "seated",
  },
];

export const mockMenu: MenuItem[] = [
  {
    id: "m1",
    name: "Burrata & roasted peppers",
    category: "Antipasti",
    price: 16,
    eightySixed: false,
  },
  {
    id: "m2",
    name: "Tagliatelle al ragù",
    category: "Primi",
    price: 24,
    eightySixed: false,
  },
  {
    id: "m3",
    name: "Branzino al forno",
    category: "Secondi",
    price: 32,
    eightySixed: true,
  },
  {
    id: "m4",
    name: "Tiramisu",
    category: "Dolci",
    price: 12,
    eightySixed: false,
  },
];

export const mockTickets: Ticket[] = [
  {
    id: "t1",
    table: "12",
    items: ["Tagliatelle ×2", "House red"],
    status: "fired",
  },
  {
    id: "t2",
    table: "5",
    items: ["Burrata", "Branzino"],
    status: "open",
  },
];

export const mockStaff: StaffShift[] = [
  { id: "s1", name: "Elena", role: "Floor", when: "4–11" },
  { id: "s2", name: "Marco", role: "Kitchen", when: "3–11" },
  { id: "s3", name: "Sofia", role: "Bar", when: "5–12" },
];

export function coversBooked(list: Reservation[] = mockReservations) {
  return list
    .filter((r) => r.status === "booked" || r.status === "seated")
    .reduce((n, r) => n + r.party, 0);
}
