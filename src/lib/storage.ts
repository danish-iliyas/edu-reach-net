// File system storage simulation for registration data
// In production, this would connect to a real backend

export interface User {
  id: string;
  username: string;
  password: string;
  role: 'admin' | 'company' | 'trainer';
  companyId?: string;
  trainerData?: {
    name: string;
    tradeId: string;
    schoolId: string;
  };
}

export interface Company {
  id: string;
  name: string;
  username: string;
  password: string;
  createdAt: string;
}

export interface State {
  id: string;
  name: string;
  companyId: string;
  createdAt: string;
}

export interface District {
  id: string;
  name: string;
  stateId: string;
  companyId: string;
  createdAt: string;
}

export interface Block {
  id: string;
  name: string;
  districtId: string;
  companyId: string;
  createdAt: string;
}

export interface Trade {
  id: string;
  name: string;
  schoolId: string;
  companyId: string;
  createdAt: string;
}

export interface Trainer {
  id: string;
  name: string;
  username: string;
  password: string;
  tradeId: string;
  schoolId: string;
  companyId: string;
  createdAt: string;
}

export interface School {
  id: string;
  name: string;
  blockId: string;
  districtId: string;
  stateId: string;
  companyId: string;
  trades: Trade[];
  trainers: Trainer[];
  createdAt: string;
}

export interface Attendance {
  id: string;
  trainerId: string;
  date: string;
  status: 'present' | 'absent';
  companyId: string;
  createdAt: string;
}

// Simulated file storage using localStorage with structured data
class FileSystemStorage {
  private getKey(type: string): string {
    return `nsqf_${type}`;
  }

  private readFile<T>(type: string): T[] {
    try {
      const data = localStorage.getItem(this.getKey(type));
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  private writeFile<T>(type: string, data: T[]): void {
    localStorage.setItem(this.getKey(type), JSON.stringify(data));
  }

  // Initialize with default data
  initialize(): void {
    // Default admin
    const users = this.getUsers();
    if (!users.find(u => u.role === 'admin')) {
      this.addUser({
        id: 'admin-1',
        username: 'admin',
        password: 'admin123',
        role: 'admin'
      });
    }

    // Default companies
    const companies = this.getCompanies();
    if (companies.length === 0) {
      const defaultCompanies = [
        { id: 'comp-1', name: 'TechSkills Institute', username: 'techskills', password: 'tech123' },
        { id: 'comp-2', name: 'Industrial Training Center', username: 'industrial', password: 'ind123' },
        { id: 'comp-3', name: 'Digital Learning Hub', username: 'digital', password: 'dig123' }
      ];

      defaultCompanies.forEach(comp => {
        this.addCompany({
          ...comp,
          createdAt: new Date().toISOString()
        });
        this.addUser({
          id: `user-${comp.id}`,
          username: comp.username,
          password: comp.password,
          role: 'company',
          companyId: comp.id
        });
      });
    }
  }

  // Users
  getUsers(): User[] {
    return this.readFile<User>('users');
  }

  addUser(user: User): void {
    const users = this.getUsers();
    users.push(user);
    this.writeFile('users', users);
  }

  authenticateUser(username: string, password: string): User | null {
    const users = this.getUsers();
    return users.find(u => u.username === username && u.password === password) || null;
  }

  // Companies
  getCompanies(): Company[] {
    return this.readFile<Company>('companies');
  }

  addCompany(company: Company): void {
    const companies = this.getCompanies();
    companies.push(company);
    this.writeFile('companies', companies);
  }

  getCompanyById(id: string): Company | null {
    return this.getCompanies().find(c => c.id === id) || null;
  }

  // States
  getStates(companyId?: string): State[] {
    const states = this.readFile<State>('states');
    return companyId ? states.filter(s => s.companyId === companyId) : states;
  }

  addState(state: State): void {
    const states = this.getStates();
    states.push(state);
    this.writeFile('states', states);
  }

  // Districts
  getDistricts(companyId?: string): District[] {
    const districts = this.readFile<District>('districts');
    return companyId ? districts.filter(d => d.companyId === companyId) : districts;
  }

  addDistrict(district: District): void {
    const districts = this.getDistricts();
    districts.push(district);
    this.writeFile('districts', districts);
  }

  // Blocks
  getBlocks(companyId?: string): Block[] {
    const blocks = this.readFile<Block>('blocks');
    return companyId ? blocks.filter(b => b.companyId === companyId) : blocks;
  }

  addBlock(block: Block): void {
    const blocks = this.getBlocks();
    blocks.push(block);
    this.writeFile('blocks', blocks);
  }

  // Schools
  getSchools(companyId?: string): School[] {
    const schools = this.readFile<School>('schools');
    return companyId ? schools.filter(s => s.companyId === companyId) : schools;
  }

  addSchool(school: School): void {
    const schools = this.getSchools();
    schools.push(school);
    this.writeFile('schools', schools);
  }

  // Trades
  getTrades(companyId?: string): Trade[] {
    const trades = this.readFile<Trade>('trades');
    return companyId ? trades.filter(t => t.companyId === companyId) : trades;
  }

  addTrade(trade: Trade): void {
    const trades = this.getTrades();
    trades.push(trade);
    this.writeFile('trades', trades);
  }

  // Trainers
  getTrainers(companyId?: string): Trainer[] {
    const trainers = this.readFile<Trainer>('trainers');
    return companyId ? trainers.filter(t => t.companyId === companyId) : trainers;
  }

  addTrainer(trainer: Trainer): void {
    const trainers = this.getTrainers();
    trainers.push(trainer);
    this.writeFile('trainers', trainers);
    
    // Also add trainer as user
    this.addUser({
      id: `trainer-${trainer.id}`,
      username: trainer.username,
      password: trainer.password,
      role: 'trainer',
      companyId: trainer.companyId,
      trainerData: {
        name: trainer.name,
        tradeId: trainer.tradeId,
        schoolId: trainer.schoolId
      }
    });
  }

  // Attendance
  getAttendance(companyId?: string, trainerId?: string, date?: string): Attendance[] {
    let attendance = this.readFile<Attendance>('attendance');
    
    if (companyId) {
      attendance = attendance.filter(a => a.companyId === companyId);
    }
    if (trainerId) {
      attendance = attendance.filter(a => a.trainerId === trainerId);
    }
    if (date) {
      attendance = attendance.filter(a => a.date === date);
    }
    
    return attendance;
  }

  addAttendance(attendance: Attendance): void {
    const records = this.getAttendance();
    // Remove existing record for same trainer and date
    const filtered = records.filter(r => !(r.trainerId === attendance.trainerId && r.date === attendance.date));
    filtered.push(attendance);
    this.writeFile('attendance', filtered);
  }

  // Statistics
  getStatistics(companyId?: string) {
    const states = this.getStates(companyId);
    const districts = this.getDistricts(companyId);
    const blocks = this.getBlocks(companyId);
    const schools = this.getSchools(companyId);
    const trades = this.getTrades(companyId);
    const trainers = this.getTrainers(companyId);
    
    return {
      totalStates: states.length,
      totalDistricts: districts.length,
      totalBlocks: blocks.length,
      totalSchools: schools.length,
      totalTrades: trades.length,
      totalTrainers: trainers.length,
      stateWiseStats: states.map(state => ({
        ...state,
        districts: districts.filter(d => d.stateId === state.id).length,
        blocks: blocks.filter(b => {
          const stateDistricts = districts.filter(d => d.stateId === state.id);
          return stateDistricts.some(d => d.id === b.districtId);
        }).length,
        schools: schools.filter(s => s.stateId === state.id).length
      }))
    };
  }
}

export const storage = new FileSystemStorage();