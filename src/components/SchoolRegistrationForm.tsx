import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  School, 
  Plus, 
  X, 
  Users, 
  Briefcase,
  Save,
  ArrowLeft,
  GraduationCap
} from 'lucide-react';
import { storage, State, District, Block, School as SchoolType, Trade, Trainer } from '@/lib/storage';
import { useToast } from '@/hooks/use-toast';

interface SchoolRegistrationFormProps {
  companyId: string;
  states: State[];
  districts: District[];
  blocks: Block[];
  onClose: () => void;
  onSuccess: () => void;
}

interface TradeWithTrainers {
  name: string;
  trainers: {
    name: string;
    username: string;
    password: string;
  }[];
}

const SchoolRegistrationForm: React.FC<SchoolRegistrationFormProps> = ({
  companyId,
  states,
  districts,
  blocks,
  onClose,
  onSuccess
}) => {
  const [formData, setFormData] = useState({
    name: '',
    stateId: '',
    districtId: '',
    blockId: ''
  });
  const [trades, setTrades] = useState<TradeWithTrainers[]>([]);
  const [currentStep, setCurrentStep] = useState<'school' | 'trades'>('school');
  const { toast } = useToast();

  const filteredDistricts = districts.filter(d => d.stateId === formData.stateId);
  const filteredBlocks = blocks.filter(b => b.districtId === formData.districtId);

  const addTrade = () => {
    setTrades([...trades, { name: '', trainers: [] }]);
  };

  const updateTrade = (index: number, name: string) => {
    const updatedTrades = [...trades];
    updatedTrades[index].name = name;
    setTrades(updatedTrades);
  };

  const removeTrade = (index: number) => {
    setTrades(trades.filter((_, i) => i !== index));
  };

  const addTrainer = (tradeIndex: number) => {
    const updatedTrades = [...trades];
    updatedTrades[tradeIndex].trainers.push({
      name: '',
      username: '',
      password: ''
    });
    setTrades(updatedTrades);
  };

  const updateTrainer = (tradeIndex: number, trainerIndex: number, field: string, value: string) => {
    const updatedTrades = [...trades];
    updatedTrades[tradeIndex].trainers[trainerIndex] = {
      ...updatedTrades[tradeIndex].trainers[trainerIndex],
      [field]: value
    };
    setTrades(updatedTrades);
  };

  const removeTrainer = (tradeIndex: number, trainerIndex: number) => {
    const updatedTrades = [...trades];
    updatedTrades[tradeIndex].trainers.splice(trainerIndex, 1);
    setTrades(updatedTrades);
  };

  const handleSchoolSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.stateId || !formData.districtId || !formData.blockId) {
      toast({
        title: "Error",
        description: "Please fill all school details",
        variant: "destructive",
      });
      return;
    }

    setCurrentStep('trades');
  };

  const handleFinalSubmit = () => {
    if (trades.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one trade",
        variant: "destructive",
      });
      return;
    }

    const invalidTrades = trades.filter(t => !t.name.trim());
    if (invalidTrades.length > 0) {
      toast({
        title: "Error",
        description: "Please provide names for all trades",
        variant: "destructive",
      });
      return;
    }

    const invalidTrainers = trades.some(t => 
      t.trainers.some(trainer => !trainer.name.trim() || !trainer.username.trim() || !trainer.password.trim())
    );
    if (invalidTrainers) {
      toast({
        title: "Error",
        description: "Please fill all trainer details",
        variant: "destructive",
      });
      return;
    }

    try {
      // Create school
      const schoolId = `school-${Date.now()}`;
      const school: SchoolType = {
        id: schoolId,
        name: formData.name,
        stateId: formData.stateId,
        districtId: formData.districtId,
        blockId: formData.blockId,
        companyId,
        trades: [],
        trainers: [],
        createdAt: new Date().toISOString()
      };

      storage.addSchool(school);

      // Create trades and trainers
      trades.forEach(trade => {
        const tradeId = `trade-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const tradeData: Trade = {
          id: tradeId,
          name: trade.name,
          schoolId,
          companyId,
          createdAt: new Date().toISOString()
        };

        storage.addTrade(tradeData);

        // Create trainers for this trade
        trade.trainers.forEach(trainer => {
          const trainerId = `trainer-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          const trainerData: Trainer = {
            id: trainerId,
            name: trainer.name,
            username: trainer.username,
            password: trainer.password,
            tradeId,
            schoolId,
            companyId,
            createdAt: new Date().toISOString()
          };

          storage.addTrainer(trainerData);
        });
      });

      toast({
        title: "Success",
        description: `School "${formData.name}" registered successfully with ${trades.length} trades and ${trades.reduce((acc, t) => acc + t.trainers.length, 0)} trainers`,
      });

      onSuccess();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to register school",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-card rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="sticky top-0 bg-card/95 backdrop-blur-sm border-b border-border/50 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <School className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Register School</h2>
                <p className="text-sm text-muted-foreground">
                  {currentStep === 'school' ? 'Step 1: School Details' : 'Step 2: Trades & Trainers'}
                </p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {currentStep === 'school' ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <School className="w-5 h-5" />
                  School Information
                </CardTitle>
                <CardDescription>
                  Provide basic details about the school
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSchoolSubmit} className="space-y-6">
                  <div>
                    <Label htmlFor="schoolName">School Name</Label>
                    <Input
                      id="schoolName"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="Enter school name"
                      className="mt-1"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label>State</Label>
                      <Select 
                        value={formData.stateId} 
                        onValueChange={(value) => setFormData({
                          ...formData, 
                          stateId: value, 
                          districtId: '', 
                          blockId: ''
                        })}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select state" />
                        </SelectTrigger>
                        <SelectContent>
                          {states.map(state => (
                            <SelectItem key={state.id} value={state.id}>{state.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>District</Label>
                      <Select 
                        value={formData.districtId} 
                        onValueChange={(value) => setFormData({
                          ...formData, 
                          districtId: value, 
                          blockId: ''
                        })}
                        disabled={!formData.stateId}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select district" />
                        </SelectTrigger>
                        <SelectContent>
                          {filteredDistricts.map(district => (
                            <SelectItem key={district.id} value={district.id}>{district.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Block</Label>
                      <Select 
                        value={formData.blockId} 
                        onValueChange={(value) => setFormData({...formData, blockId: value})}
                        disabled={!formData.districtId}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select block" />
                        </SelectTrigger>
                        <SelectContent>
                          {filteredBlocks.map(block => (
                            <SelectItem key={block.id} value={block.id}>{block.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3">
                    <Button type="button" variant="outline" onClick={onClose}>
                      Cancel
                    </Button>
                    <Button type="submit">
                      Next: Add Trades
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="w-5 h-5" />
                    Trades & Trainers
                  </CardTitle>
                  <CardDescription>
                    Add trades and their respective trainers for {formData.name}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {trades.map((trade, tradeIndex) => (
                      <Card key={tradeIndex} className="border-2 border-dashed border-border/50">
                        <CardHeader className="pb-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Briefcase className="w-4 h-4 text-primary" />
                              <Label>Trade {tradeIndex + 1}</Label>
                            </div>
                            {trades.length > 1 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeTrade(tradeIndex)}
                                className="text-destructive hover:text-destructive"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                          <Input
                            value={trade.name}
                            onChange={(e) => updateTrade(tradeIndex, e.target.value)}
                            placeholder="Enter trade name (e.g., Electrician, Plumber)"
                            className="mt-2"
                          />
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <Label className="flex items-center gap-2">
                                <Users className="w-4 h-4" />
                                Trainers for this trade
                              </Label>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => addTrainer(tradeIndex)}
                              >
                                <Plus className="w-4 h-4 mr-1" />
                                Add Trainer
                              </Button>
                            </div>

                            {trade.trainers.length === 0 ? (
                              <div className="text-center py-4 text-muted-foreground">
                                No trainers added for this trade
                              </div>
                            ) : (
                              <div className="grid gap-4">
                                {trade.trainers.map((trainer, trainerIndex) => (
                                  <div key={trainerIndex} className="grid grid-cols-1 md:grid-cols-4 gap-3 p-3 bg-background/50 rounded-lg border">
                                    <div className="md:col-span-1">
                                      <Label className="text-xs">Trainer Name</Label>
                                      <Input
                                        value={trainer.name}
                                        onChange={(e) => updateTrainer(tradeIndex, trainerIndex, 'name', e.target.value)}
                                        placeholder="Full name"
                                        className="mt-1"
                                      />
                                    </div>
                                    <div className="md:col-span-1">
                                      <Label className="text-xs">Username</Label>
                                      <Input
                                        value={trainer.username}
                                        onChange={(e) => updateTrainer(tradeIndex, trainerIndex, 'username', e.target.value)}
                                        placeholder="Login username"
                                        className="mt-1"
                                      />
                                    </div>
                                    <div className="md:col-span-1">
                                      <Label className="text-xs">Password</Label>
                                      <Input
                                        value={trainer.password}
                                        onChange={(e) => updateTrainer(tradeIndex, trainerIndex, 'password', e.target.value)}
                                        placeholder="Login password"
                                        type="password"
                                        className="mt-1"
                                      />
                                    </div>
                                    <div className="flex items-end">
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeTrainer(tradeIndex, trainerIndex)}
                                        className="text-destructive hover:text-destructive"
                                      >
                                        <X className="w-4 h-4" />
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}

                    <Button
                      type="button"
                      variant="outline"
                      onClick={addTrade}
                      className="w-full border-dashed border-2"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Another Trade
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentStep('school')}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to School Details
                </Button>
                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button onClick={handleFinalSubmit}>
                    <Save className="w-4 h-4 mr-2" />
                    Register School
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SchoolRegistrationForm;