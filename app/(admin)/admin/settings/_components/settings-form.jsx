"use client";

import {
  getDealershipInfo,
  getUsers,
  saveWorkingHours,
  updateUserRole,
} from "@/actions/settings";
import useFetch from "@/hooks/use-fetch";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Clock, Loader2, Save, Shield } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const DAYS = [
  { value: "MONDAY", label: "Monday" },
  { value: "TUESDAY", label: "Tuesday" },
  { value: "WEDNESDAY", label: "Wednesday" },
  { value: "THURSDAY", label: "Thursday" },
  { value: "FRIDAY", label: "Friday" },
  { value: "SATURDAY", label: "Saturday" },
  { value: "SUNDAY", label: "Sunday" },
];

const SettingsForm = () => {
  const [workingHours, setWorkingHours] = useState(
    DAYS.map((day) => ({
      dayOfWeek: day.value,
      openTime: "09:00",
      closeTime: "18:00",
      isOpen: day.value !== "SUNDAY",
    }))
  );

  const [UserSearch, setUserSearch] = useState("");

  const {
    loading: fetchingSettings,
    fn: fetchDealershipInfo,
    data: settingsData,
    error: settingsError,
  } = useFetch(getDealershipInfo);

  // Set working hours when settings data is fetched
  useEffect(() => {
    if (settingsData?.success && settingsData.data) {
      const dealership = settingsData.data;

      // Map the working hours
      if (dealership.workingHours.length > 0) {
        const mappedHours = DAYS.map((day) => {
          // Find matching working hour
          const hourData = dealership.workingHours.find(
            (h) => h.dayOfWeek === day.value
          );

          if (hourData) {
            return {
              dayOfWeek: hourData.dayOfWeek,
              openTime: hourData.openTime,
              closeTime: hourData.closeTime,
              isOpen: hourData.isOpen,
            };
          }

          // Default values if no working hour is found
          return {
            dayOfWeek: day.value,
            openTime: "09:00",
            closeTime: "18:00",
            isOpen: day.value !== "SUNDAY",
          };
        });

        setWorkingHours(mappedHours);
      }
    }
  }, [settingsData]);

  const {
    loading: savingHours,
    fn: saveHours,
    data: saveResult,
    error: saveError,
  } = useFetch(saveWorkingHours);

  const {
    loading: fetchingUsers,
    fn: fetchUsers,
    data: usersData,
    error: usersError,
  } = useFetch(getUsers);

  const {
    loading: updatingRole,
    fn: updateRole,
    data: updateRoleResult,
    error: updateRoleError,
  } = useFetch(updateUserRole);

  useEffect(() => {
    if (settingsError) toast.error("Failed to load dealership settings");
    if (saveError)
      toast.error(`Failed to save working horus: ${saveError.message}`);
    if (usersError) toast.error("Failed to load users");
    if (updateRoleError)
      toast.error(`Failed to update user role: ${updateRoleError.message}`);
  }, [settingsError, saveError, usersError, updateRoleError]);

  // Fetch settings and users on component mount
  useEffect(() => {
    fetchDealershipInfo();
    fetchUsers();
  }, []);

  useEffect(() => {
    if (saveResult?.success) {
      toast.success("Working hours saved successfully");
      fetchDealershipInfo();
    }

    if (updateRoleResult?.success) {
      toast.success("User Role is updated successfully");
      fetchUsers();
    }
  }, [saveResult, updateRoleResult]);

  // Handle Errors
  useEffect(() => {
    if (settingsError) {
      toast.error("Failed to laod dealership settings");
    }
    if (saveError) {
      toast.error(`Failed to save working hours: ${saveError.message}`);
    }
    if (usersError) {
      toast.error("Failed to load users");
    }
    if (updateRoleError) {
      toast.error(`Failed to update user role: ${updateRoleError.message}`);
    }
  }, [settingsError, saveError, usersError, updateRoleError]);

  // Handle Successful operations
  useEffect(() => {
    if (saveResult?.success) {
      toast.success("Working hours saved successfully");
      fetchDealershipInfo();
    }
    if (updateRoleResult?.success) {
      toast.success("User role Updated successfully");
      fetchUsers();
    }
  }, [saveResult, updateRoleResult]);

  const handleWorkingHourChange = (index, field, value) => {
    const updatedHours = [...workingHours];
    updatedHours[index] = {
      ...updatedHours[index],
      [field]: value,
    };
    setWorkingHours(updatedHours);
  };

  const handleSaveHours = async () => {
    await saveHours(workingHours);
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="hours">
        <TabsList className="space-x-2">
          <TabsTrigger value="hours">
            <Clock className="h-4 w-4 mr-2" /> Working Hours
          </TabsTrigger>
          <TabsTrigger value="admins">
            <Shield className="h-4 w-4 mr-2" /> Admin Users
          </TabsTrigger>
        </TabsList>
        <TabsContent value="hours" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Working Hours</CardTitle>
              <CardDescription>
                Set your dealership's working hours for each day of the week.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {DAYS.map((day, index) => {
                  return (
                    <div
                      key={day.value}
                      className="grid grid-cols-12 gap-4 items-center py-3 px-4 rounded-lg hover:bg-slate-50"
                    >
                      <div className="col-span-3 md:col-span-2">
                        <div className="font-medium">{day.label}</div>
                      </div>

                      <div className="col-span-9 md:col-span-2 flex items-center">
                        <Checkbox
                          id={`is-open-${day.value}`}
                          checked={workingHours[index]?.isOpen}
                          onCheckedChange={(checked) =>
                            handleWorkingHourChange(index, "isOpen", checked)
                          }
                        />
                        <Label
                          htmlFor={`is-open-${day.value}`}
                          className="ml-2 cursor-ponter"
                        >
                          {workingHours[index]?.isOpen ? "Open" : "Closed"}
                        </Label>
                      </div>

                      {workingHours[index]?.isOpen && (
                        <>
                          <div className="col-span-5 md:col-span-4">
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 text-gray-500 mr-2 " />
                              <Input
                                type="time"
                                value={workingHours[index]?.openTime}
                                onChange={(e) =>
                                  handleWorkingHourChange(
                                    index,
                                    "openTime",
                                    e.target.value
                                  )
                                }
                                className="text-sm"
                              />
                            </div>
                          </div>

                          <div className="text-center col-span-1">to</div>

                          <div className="col-span-5 md:col-span-3">
                            <Input
                              type="time"
                              value={workingHours[index]?.closeTime}
                              onChange={(e) =>
                                handleWorkingHourChange(
                                  index,
                                  "closeTime",
                                  e.target.value
                                )
                              }
                              className="text-sm"
                            />
                          </div>
                        </>
                      )}

                      {!workingHours[index]?.isOpen && (
                        <div className="col-span-11 md:col-span-8 text-gray-500 italic text-sm">
                          Closed all day
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 flex justify-end">
                <Button onClick={handleSaveHours} disabled={savingHours}>
                  {savingHours ? (
                    <>
                      {" "}
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" /> Save Wroking Hours
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="password">Change your password here.</TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsForm;
