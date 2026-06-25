import { create } from 'zustand';
import { ExecomMember, UserRole, UserStatus } from '@/types/models';

interface MembersState {
  members: ExecomMember[];
  isLoading: boolean;
  fetchMembers: () => Promise<void>;
}

const MOCK_MEMBERS: ExecomMember[] = [
  {
    id: '1',
    fullName: 'Adhit V',
    email: 'adhit@mbcet.ac.in',
    branchBatch: 'CS2020',
    department: 'CS',
    contact: '9876543210',
    skills: ['Flutter', 'Next.js'],
    areasOfExpertise: 'Web Dev',
    socialLinks: {},
    role: UserRole.chapterAdmin,
    designation: 'Chairperson',
    activeStatus: UserStatus.active,
    corePoints: 1250
  },
  {
    id: '2',
    fullName: 'Elena G',
    email: 'elena@mbcet.ac.in',
    branchBatch: 'CS2021',
    department: 'CS',
    contact: '1234567890',
    skills: ['Figma', 'UI/UX'],
    areasOfExpertise: 'Design',
    socialLinks: {},
    role: UserRole.prMedia,
    designation: 'Design Head',
    activeStatus: UserStatus.active,
    corePoints: 980
  },
  {
    id: '3',
    fullName: 'Rahul K',
    email: 'rahul@mbcet.ac.in',
    branchBatch: 'EC2020',
    department: 'EC',
    contact: '9988776655',
    skills: ['Python', 'AI'],
    areasOfExpertise: 'Machine Learning',
    socialLinks: {},
    role: UserRole.techHead,
    designation: 'Tech Head',
    activeStatus: UserStatus.active,
    corePoints: 1120
  },
  {
    id: '4',
    fullName: 'Sarah T',
    email: 'sarah@mbcet.ac.in',
    branchBatch: 'CE2022',
    department: 'CE',
    contact: '7788994455',
    skills: ['Management', 'Speaking'],
    areasOfExpertise: 'Event Mgt',
    socialLinks: {},
    role: UserRole.generalMember,
    designation: 'General Member',
    activeStatus: UserStatus.active,
    corePoints: 450
  },
  {
    id: '5',
    fullName: 'Mike W',
    email: 'mike@mbcet.ac.in',
    branchBatch: 'EE2021',
    department: 'EE',
    contact: '1122334455',
    skills: ['Hardware', 'IoT'],
    areasOfExpertise: 'IoT',
    socialLinks: {},
    role: UserRole.generalMember,
    designation: 'General Member',
    activeStatus: UserStatus.active,
    corePoints: 320
  }
];

export const useMembersStore = create<MembersState>((set) => ({
  members: [],
  isLoading: false,
  fetchMembers: async () => {
    set({ isLoading: true });
    // mock delay
    await new Promise((resolve) => setTimeout(resolve, 800));
    // sort by points desc
    const sorted = [...MOCK_MEMBERS].sort((a, b) => b.corePoints - a.corePoints);
    set({ members: sorted, isLoading: false });
  }
}));
