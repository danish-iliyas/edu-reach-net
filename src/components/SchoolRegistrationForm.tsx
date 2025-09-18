"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  School,
  Plus,
  X,
  Users,
  Briefcase,
  Save,
  ArrowLeft,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getBlocks, createSchool, getTrades } from "@/service/companyAdminApi";

interface SchoolRegistrationFormProps {
  companyId: string;
  onClose: () => void;
  onSuccess: () => void;
}

interface Trainer {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  status: string;
  coordinates: string;
}

interface TradeWithTrainers {
  tradeId: string;
  trainers: Trainer[];
}

const SchoolRegistrationForm: React.FC<SchoolRegistrationFormProps> = ({
  companyId,
  onClose,
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    uid: "",
    name: "",
    blockId: "",
    address: "",
    latitude: "",
    longitude: "",
  });

  const [blocks, setBlocks] = useState<any[]>([]);
  const [trades, setTrades] = useState<TradeWithTrainers[]>([]);
  const [availableTrades, setAvailableTrades] = useState<any[]>([]);
  const [currentStep, setCurrentStep] = useState<"school" | "trades">("school");
  const { toast } = useToast();

  // Fetch blocks
  useEffect(() => {
    async function fetchBlocks() {
      try {
        const res = await getBlocks();
        setBlocks(res);
      } catch (error) {
        console.error("Failed to fetch blocks:", error);
      }
    }
    fetchBlocks();
  }, []);

  // Fetch trades
  useEffect(() => {
    async function fetchTrades() {
      try {
        const res = await getTrades();
        setAvailableTrades(res);
      } catch (error) {
        console.error("Failed to fetch trades:", error);
      }
    }
    fetchTrades();
  }, []);

  const addTrade = () => {
    setTrades([...trades, { tradeId: "", trainers: [] }]);
  };

  const updateTrade = (index: number, tradeId: string) => {
    const updatedTrades = [...trades];
    updatedTrades[index].tradeId = tradeId;
    setTrades(updatedTrades);
  };

  const removeTrade = (index: number) => {
    setTrades(trades.filter((_, i) => i !== index));
  };

  const addTrainer = (tradeIndex: number) => {
    const updatedTrades = [...trades];
    updatedTrades[tradeIndex].trainers.push({
      fullName: "",
      email: "",
      phone: "",
      password: "",
      status: "active",
      coordinates: "",
    });
    setTrades(updatedTrades);
  };

  const updateTrainer = (
    tradeIndex: number,
    trainerIndex: number,
    field: keyof Trainer,
    value: string
  ) => {
    const updatedTrades = [...trades];
    updatedTrades[tradeIndex].trainers[trainerIndex] = {
      ...updatedTrades[tradeIndex].trainers[trainerIndex],
      [field]: value,
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

    if (
      !formData.uid ||
      !formData.name ||
      !formData.blockId ||
      !formData.address ||
      !formData.latitude ||
      !formData.longitude
    ) {
      toast({
        title: "Error",
        description: "Please fill all school details",
        variant: "destructive",
      });
      return;
    }

    setCurrentStep("trades");
  };

  const handleFinalSubmit = async () => {
    if (trades.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one trade",
        variant: "destructive",
      });
      return;
    }

    if (trades.some((t) => !t.tradeId)) {
      toast({
        title: "Error",
        description: "Please select trades for all entries",
        variant: "destructive",
      });
      return;
    }

    const invalidTrainers = trades.some((t) =>
      t.trainers.some(
        (trainer) =>
          !trainer.fullName.trim() ||
          !trainer.email.trim() ||
          !trainer.phone.trim() ||
          !trainer.password.trim() ||
          !trainer.coordinates.trim()
      )
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
      const payload = {
        uid: formData.uid,
        name: formData.name,
        address: formData.address,
        blockId: formData.blockId,
        location: {
          type: "Point",
          coordinates: [
            parseFloat(formData.longitude),
            parseFloat(formData.latitude),
          ],
        },
        trades: trades.map((t) => ({
          tradeId: t.tradeId,
          trainers: t.trainers.map((tr) => ({
            fullName: tr.fullName,
            email: tr.email,
            phone: tr.phone,
            password: tr.password,
            status: tr.status,
            location: {
              type: "Point",
              coordinates: tr.coordinates
                .split(",")
                .map((c) => parseFloat(c.trim())),
            },
          })),
        })),
      };

      const response = await createSchool(payload);

      toast({
        title: "Success",
        description: `School "${formData.name}" registered successfully`,
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
    <div className='fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50'>
      <div className='bg-card rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden'>
        <div className='sticky top-0 bg-card/95 backdrop-blur-sm border-b border-border/50 p-6'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              <div className='p-2 bg-primary/10 rounded-lg'>
                <School className='w-6 h-6 text-primary' />
              </div>
              <div>
                <h2 className='text-2xl font-bold'>Register School</h2>
                <p className='text-sm text-muted-foreground'>
                  {currentStep === "school"
                    ? "Step 1: School Details"
                    : "Step 2: Trades & Trainers"}
                </p>
              </div>
            </div>
            <Button variant='ghost' size='sm' onClick={onClose}>
              <X className='w-4 h-4' />
            </Button>
          </div>
        </div>

        <div className='p-6 overflow-y-auto max-h-[calc(90vh-140px)]'>
          {currentStep === "school" ? (
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <School className='w-5 h-5' />
                  School Information
                </CardTitle>
                <CardDescription>
                  Provide basic details about the school
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSchoolSubmit} className='space-y-6'>
                  <div>
                    <Label htmlFor='schoolId'>School ID</Label>
                    <Input
                      id='schoolId'
                      value={formData.uid}
                      onChange={(e) =>
                        setFormData({ ...formData, uid: e.target.value })
                      }
                      placeholder='Enter school ID'
                      className='mt-1'
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor='schoolName'>School Name</Label>
                    <Input
                      id='schoolName'
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder='Enter school name'
                      className='mt-1'
                      required
                    />
                  </div>

                  <div>
                    <Label>Block</Label>
                    <Select
                      value={formData.blockId}
                      onValueChange={(value) =>
                        setFormData({ ...formData, blockId: value })
                      }
                    >
                      <SelectTrigger className='mt-1'>
                        <SelectValue placeholder='Select block' />
                      </SelectTrigger>
                      <SelectContent>
                        {blocks.map((block) => (
                          <SelectItem key={block._id} value={block._id}>
                            {block.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Address</Label>
                    <Input
                      value={formData.address}
                      onChange={(e) =>
                        setFormData({ ...formData, address: e.target.value })
                      }
                      placeholder='Enter address'
                      className='mt-1'
                      required
                    />
                  </div>

                  <div className='grid grid-cols-2 gap-4'>
                    <div>
                      <Label>Latitude</Label>
                      <Input
                        type='number'
                        step='any'
                        value={formData.latitude}
                        onChange={(e) =>
                          setFormData({ ...formData, latitude: e.target.value })
                        }
                        placeholder='Latitude'
                        className='mt-1'
                        required
                      />
                    </div>

                    <div>
                      <Label>Longitude</Label>
                      <Input
                        type='number'
                        step='any'
                        value={formData.longitude}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            longitude: e.target.value,
                          })
                        }
                        placeholder='Longitude'
                        className='mt-1'
                        required
                      />
                    </div>
                  </div>

                  <div className='flex justify-end gap-3'>
                    <Button type='button' variant='outline' onClick={onClose}>
                      Cancel
                    </Button>
                    <Button type='submit'>Next: Add Trades</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          ) : (
            <div className='space-y-6'>
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2'>
                    <Briefcase className='w-5 h-5' />
                    Trades & Trainers
                  </CardTitle>
                  <CardDescription>
                    Add trades and their respective trainers for {formData.name}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className='space-y-6'>
                    {trades.map((trade, tradeIndex) => (
                      <Card
                        key={tradeIndex}
                        className='border-2 border-dashed border-border/50'
                      >
                        <CardHeader className='pb-4'>
                          <div className='flex items-center justify-between'>
                            <div className='flex items-center gap-2'>
                              <Briefcase className='w-4 h-4 text-primary' />
                              <Label>Trade {tradeIndex + 1}</Label>
                            </div>
                            {trades.length > 1 && (
                              <Button
                                type='button'
                                variant='ghost'
                                size='sm'
                                onClick={() => removeTrade(tradeIndex)}
                                className='text-destructive hover:text-destructive'
                              >
                                <X className='w-4 h-4' />
                              </Button>
                            )}
                          </div>

                          {/* Trade Dropdown */}
                          <Select
                            value={trade.tradeId}
                            onValueChange={(value) =>
                              updateTrade(tradeIndex, value)
                            }
                          >
                            <SelectTrigger className='mt-2'>
                              <SelectValue placeholder='Select trade' />
                            </SelectTrigger>
                            <SelectContent>
                              {availableTrades.map((t) => (
                                <SelectItem key={t._id} value={t._id}>
                                  {t.name} ({t.category})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </CardHeader>

                        <CardContent>
                          <div className='space-y-4'>
                            <div className='flex items-center justify-between'>
                              <Label className='flex items-center gap-2'>
                                <Users className='w-4 h-4' />
                                Trainers for this trade
                              </Label>
                              <Button
                                type='button'
                                variant='outline'
                                size='sm'
                                onClick={() => addTrainer(tradeIndex)}
                              >
                                <Plus className='w-4 h-4 mr-1' />
                                Add Trainer
                              </Button>
                            </div>

                            {trade.trainers.length === 0 ? (
                              <div className='text-center py-4 text-muted-foreground'>
                                No trainers added for this trade
                              </div>
                            ) : (
                              <div className='grid gap-4'>
                                {trade.trainers.map((trainer, trainerIndex) => (
                                  <div
                                    key={trainerIndex}
                                    className='p-4 bg-background/50 rounded-lg border space-y-4'
                                  >
                                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                      <div>
                                        <Label className='text-xs'>
                                          Full Name
                                        </Label>
                                        <Input
                                          value={trainer.fullName}
                                          onChange={(e) =>
                                            updateTrainer(
                                              tradeIndex,
                                              trainerIndex,
                                              "fullName",
                                              e.target.value
                                            )
                                          }
                                          placeholder='Full name'
                                          className='mt-1'
                                        />
                                      </div>
                                      <div>
                                        <Label className='text-xs'>Email</Label>
                                        <Input
                                          type='email'
                                          value={trainer.email}
                                          onChange={(e) =>
                                            updateTrainer(
                                              tradeIndex,
                                              trainerIndex,
                                              "email",
                                              e.target.value
                                            )
                                          }
                                          placeholder='Email address'
                                          className='mt-1'
                                        />
                                      </div>
                                    </div>

                                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                      <div>
                                        <Label className='text-xs'>Phone</Label>
                                        <Input
                                          value={trainer.phone}
                                          onChange={(e) =>
                                            updateTrainer(
                                              tradeIndex,
                                              trainerIndex,
                                              "phone",
                                              e.target.value
                                            )
                                          }
                                          placeholder='Phone number'
                                          className='mt-1'
                                        />
                                      </div>
                                      <div>
                                        <Label className='text-xs'>
                                          Password
                                        </Label>
                                        <Input
                                          type='password'
                                          value={trainer.password}
                                          onChange={(e) =>
                                            updateTrainer(
                                              tradeIndex,
                                              trainerIndex,
                                              "password",
                                              e.target.value
                                            )
                                          }
                                          placeholder='Password'
                                          className='mt-1'
                                        />
                                      </div>
                                    </div>

                                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                      <div>
                                        <Label className='text-xs'>
                                          Status
                                        </Label>
                                        <Select
                                          value={trainer.status}
                                          onValueChange={(val) =>
                                            updateTrainer(
                                              tradeIndex,
                                              trainerIndex,
                                              "status",
                                              val
                                            )
                                          }
                                        >
                                          <SelectTrigger className='mt-1'>
                                            <SelectValue placeholder='Status' />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value='active'>
                                              Active
                                            </SelectItem>
                                            <SelectItem value='inactive'>
                                              Inactive
                                            </SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </div>
                                    </div>

                                    <div className='flex justify-end'>
                                      <Button
                                        type='button'
                                        variant='ghost'
                                        size='sm'
                                        onClick={() =>
                                          removeTrainer(
                                            tradeIndex,
                                            trainerIndex
                                          )
                                        }
                                        className='text-destructive hover:text-destructive'
                                      >
                                        <X className='w-4 h-4' />
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
                      type='button'
                      variant='outline'
                      onClick={addTrade}
                      className='w-full border-dashed border-2'
                    >
                      <Plus className='w-4 h-4 mr-2' />
                      Add Another Trade
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <div className='flex justify-between'>
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => setCurrentStep("school")}
                >
                  <ArrowLeft className='w-4 h-4 mr-2' />
                  Back to School Details
                </Button>
                <div className='flex gap-3'>
                  <Button type='button' variant='outline' onClick={onClose}>
                    Cancel
                  </Button>
                  <Button onClick={handleFinalSubmit}>
                    <Save className='w-4 h-4 mr-2' />
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
