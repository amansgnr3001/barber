import React, { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Scissors, Sparkles, Brush, Clock, Loader2, ArrowLeft, Plus, Edit, Trash2, X, AlertTriangle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";

interface Service {
  _id: string;
  name: string;
  cost: string;
  time: string;
  gender: string;
}

const BarberServices: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [selectedGender, setSelectedGender] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [deletingServiceId, setDeletingServiceId] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<{ id: string; name: string } | null>(null);
  const [newService, setNewService] = useState({
    name: '',
    cost: '',
    time: '',
    gender: 'male'
  });
  const [editService, setEditService] = useState({
    name: '',
    cost: '',
    time: '',
    gender: 'male'
  });
  const { toast } = useToast();
  const navigate = useNavigate();

  // Fetch services from database
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const token = localStorage.getItem('token');
        console.log('🔍 Fetching services with token:', token ? 'Present' : 'Missing');

        const response = await fetch('http://localhost:3001/api/services', {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });

        console.log('📡 Services fetch response:', response.status, response.ok);

        if (!response.ok) {
          const errorData = await response.json();
          console.error('❌ Services fetch failed:', errorData);
          throw new Error(`Failed to fetch services: ${response.status} - ${errorData.error || 'Unknown error'}`);
        }

        const data = await response.json();
        console.log('✅ Services fetched successfully:', data.length, 'services');
        setServices(data);
        setFilteredServices(data);
      } catch (error) {
        console.error('Error fetching services:', error);
        toast({
          title: "Error",
          description: `Failed to load services: ${error.message}`,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchServices();
  }, [toast]);

  // Filter services based on selected gender
  useEffect(() => {
    if (selectedGender === 'all') {
      setFilteredServices(services);
    } else {
      setFilteredServices(services.filter(service => service.gender === selectedGender));
    }
  }, [selectedGender, services]);

  // Get appropriate icon for service
  const getServiceIcon = (serviceName: string) => {
    const name = serviceName.toLowerCase();
    if (name.includes('haircut') || name.includes('cut')) return Scissors;
    if (name.includes('shave') || name.includes('beard')) return Brush;
    if (name.includes('style') || name.includes('color')) return Sparkles;
    return Clock;
  };

  // Get badge variant for gender
  const getGenderBadgeVariant = (gender: string) => {
    return gender === 'male' ? 'default' : 'secondary';
  };

  // Handle input changes for new service form
  const handleInputChange = (field: string, value: string) => {
    setNewService(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle add new service
  const handleAddService = async () => {
    try {
      // Validate required fields
      if (!newService.name || !newService.cost || !newService.time) {
        toast({
          title: "Error",
          description: "Please fill in all fields",
          variant: "destructive",
        });
        return;
      }

      setIsAdding(true);

      const token = localStorage.getItem('token');
      console.log('🔍 Adding service with token:', token ? 'Present' : 'Missing');
      console.log('📝 Service data:', newService);

      const response = await fetch('http://localhost:3001/api/services', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: newService.name.trim(),
          cost: newService.cost.trim(),
          time: newService.time.trim(),
          gender: newService.gender
        })
      });

      console.log('📡 Add service response:', response.status, response.ok);
      const data = await response.json();
      console.log('📡 Add service data:', data);

      if (response.ok) {
        // Add to local state
        setServices([...services, data.service]);

        // Reset form and close
        setNewService({ name: '', cost: '', time: '', gender: 'male' });
        setShowAddForm(false);

        toast({
          title: "Success",
          description: "New service added successfully!",
        });
      } else {
        throw new Error(data.error || 'Failed to create service');
      }

    } catch (error) {
      console.error('❌ Error creating service:', error);
      toast({
        title: "Error",
        description: `Failed to create service: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsAdding(false);
    }
  };

  // Handle cancel add service
  const handleCancelAdd = () => {
    setNewService({ name: '', cost: '', time: '', gender: 'male' });
    setShowAddForm(false);
  };

  // Handle input changes for edit service form
  const handleEditInputChange = (field: string, value: string) => {
    setEditService(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle edit service button click
  const handleEditClick = (service: Service) => {
    setEditingServiceId(service._id);
    setEditService({
      name: service.name,
      cost: service.cost,
      time: service.time,
      gender: service.gender
    });
    setShowEditForm(true);
    setShowAddForm(false); // Close add form if open
  };

  // Handle update service
  const handleUpdateService = async () => {
    try {
      // Validate required fields
      if (!editService.name || !editService.cost || !editService.time) {
        toast({
          title: "Error",
          description: "Please fill in all fields",
          variant: "destructive",
        });
        return;
      }

      if (!editingServiceId) return;

      setIsEditing(true);

      const token = localStorage.getItem('token');
      console.log('🔍 Updating service with token:', token ? 'Present' : 'Missing');
      console.log('✏️ Service ID:', editingServiceId);
      console.log('📝 Service data:', editService);

      const response = await fetch(`http://localhost:3001/api/services/${editingServiceId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: editService.name.trim(),
          cost: editService.cost.trim(),
          time: editService.time.trim(),
          gender: editService.gender
        })
      });

      console.log('📡 Update service response:', response.status, response.ok);
      const data = await response.json();
      console.log('📡 Update service data:', data);

      if (response.ok) {
        // Update local state
        setServices(services.map(s =>
          s._id === editingServiceId ? data.service : s
        ));

        // Reset form and close
        setEditService({ name: '', cost: '', time: '', gender: 'male' });
        setShowEditForm(false);
        setEditingServiceId(null);

        toast({
          title: "Success",
          description: "Service updated successfully!",
        });
      } else {
        throw new Error(data.error || 'Failed to update service');
      }

    } catch (error) {
      console.error('Error updating service:', error);
      toast({
        title: "Error",
        description: "Failed to update service. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsEditing(false);
    }
  };

  // Handle cancel edit service
  const handleCancelEdit = () => {
    setEditService({ name: '', cost: '', time: '', gender: 'male' });
    setShowEditForm(false);
    setEditingServiceId(null);
  };

  // Handle delete service click (show confirmation dialog)
  const handleDeleteClick = (serviceId: string, serviceName: string) => {
    setServiceToDelete({ id: serviceId, name: serviceName });
    setShowDeleteDialog(true);
  };

  // Handle actual delete service (after confirmation)
  const handleConfirmDelete = async () => {
    if (!serviceToDelete) return;

    try {
      setDeletingServiceId(serviceToDelete.id);

      const token = localStorage.getItem('token');
      console.log('🔍 Deleting service with token:', token ? 'Present' : 'Missing');
      console.log('🗑️ Service to delete:', serviceToDelete);

      const response = await fetch(`http://localhost:3001/api/services/${serviceToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('📡 Delete service response:', response.status, response.ok);
      const data = await response.json();
      console.log('📡 Delete service data:', data);

      if (response.ok) {
        // Remove from local state
        setServices(services.filter(s => s._id !== serviceToDelete.id));

        toast({
          title: "Success",
          description: "Service deleted successfully!",
        });
      } else {
        throw new Error(data.error || 'Failed to delete service');
      }

    } catch (error) {
      console.error('❌ Error deleting service:', error);
      toast({
        title: "Error",
        description: `Failed to delete service: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setDeletingServiceId(null);
      setShowDeleteDialog(false);
      setServiceToDelete(null);
    }
  };

  // Handle cancel delete
  const handleCancelDelete = () => {
    setShowDeleteDialog(false);
    setServiceToDelete(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => navigate('/barber/dashboard')}
                className="hover:bg-gray-100"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Services Management</h1>
                <p className="text-gray-600">Manage your barber shop services</p>
              </div>
            </div>
            <Button
              className="flex items-center gap-2"
              onClick={() => setShowAddForm(true)}
            >
              <Plus className="h-4 w-4" />
              Add New Service
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Filters and Stats */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex items-center gap-4">
              <Select value={selectedGender} onValueChange={setSelectedGender}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Services</SelectItem>
                  <SelectItem value="male">Male Services</SelectItem>
                  <SelectItem value="female">Female Services</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>Total Services: {services.length}</span>
              <span>Showing: {filteredServices.length}</span>
            </div>
          </div>
        </div>

        {/* Add New Service Form */}
        {showAddForm && (
          <div className="mb-8">
            <Card className="border-2 border-primary/20 bg-primary/5">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="h-5 w-5" />
                    Add New Service
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCancelAdd}
                    className="hover:bg-red-50 hover:text-red-600"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Service Name */}
                  <div className="space-y-2">
                    <Label htmlFor="service-name">Service Name</Label>
                    <Input
                      id="service-name"
                      placeholder="e.g., Classic Haircut"
                      value={newService.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                    />
                  </div>

                  {/* Cost */}
                  <div className="space-y-2">
                    <Label htmlFor="service-cost">Cost</Label>
                    <Input
                      id="service-cost"
                      placeholder="e.g., $25"
                      value={newService.cost}
                      onChange={(e) => handleInputChange('cost', e.target.value)}
                    />
                  </div>

                  {/* Time */}
                  <div className="space-y-2">
                    <Label htmlFor="service-time">Duration</Label>
                    <Input
                      id="service-time"
                      placeholder="e.g., 30 minutes"
                      value={newService.time}
                      onChange={(e) => handleInputChange('time', e.target.value)}
                    />
                  </div>

                  {/* Gender */}
                  <div className="space-y-2">
                    <Label htmlFor="service-gender">Gender</Label>
                    <Select
                      value={newService.gender}
                      onValueChange={(value) => handleInputChange('gender', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 mt-6">
                  <Button
                    onClick={handleAddService}
                    disabled={isAdding}
                    className="flex items-center gap-2"
                  >
                    {isAdding ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4" />
                        Add Service
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleCancelAdd}
                    disabled={isAdding}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Edit Service Form */}
        {showEditForm && (
          <div className="mb-8">
            <Card className="border-2 border-orange-200 bg-orange-50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Edit className="h-5 w-5" />
                    Edit Service
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCancelEdit}
                    className="hover:bg-red-50 hover:text-red-600"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Service Name */}
                  <div className="space-y-2">
                    <Label htmlFor="edit-service-name">Service Name</Label>
                    <Input
                      id="edit-service-name"
                      placeholder="e.g., Classic Haircut"
                      value={editService.name}
                      onChange={(e) => handleEditInputChange('name', e.target.value)}
                    />
                  </div>

                  {/* Cost */}
                  <div className="space-y-2">
                    <Label htmlFor="edit-service-cost">Cost</Label>
                    <Input
                      id="edit-service-cost"
                      placeholder="e.g., $25"
                      value={editService.cost}
                      onChange={(e) => handleEditInputChange('cost', e.target.value)}
                    />
                  </div>

                  {/* Time */}
                  <div className="space-y-2">
                    <Label htmlFor="edit-service-time">Duration</Label>
                    <Input
                      id="edit-service-time"
                      placeholder="e.g., 30 minutes"
                      value={editService.time}
                      onChange={(e) => handleEditInputChange('time', e.target.value)}
                    />
                  </div>

                  {/* Gender */}
                  <div className="space-y-2">
                    <Label htmlFor="edit-service-gender">Gender</Label>
                    <Select
                      value={editService.gender}
                      onValueChange={(value) => handleEditInputChange('gender', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 mt-6">
                  <Button
                    onClick={handleUpdateService}
                    disabled={isEditing}
                    className="flex items-center gap-2"
                  >
                    {isEditing ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <Edit className="h-4 w-4" />
                        Update Service
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleCancelEdit}
                    disabled={isEditing}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Services Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-12 w-12 animate-spin" />
            <span className="ml-3 text-lg">Loading services...</span>
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-lg text-muted-foreground">
              No services found for the selected filter.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredServices.map((service) => {
              const IconComponent = getServiceIcon(service.name);
              return (
                <Card key={service._id} className="hover:shadow-lg transition-shadow duration-300">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <IconComponent aria-hidden className="opacity-80 h-5 w-5" />
                      <span className="text-lg">{service.name}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                          Duration: {service.time}
                        </p>
                        <Badge variant={getGenderBadgeVariant(service.gender)}>
                          {service.gender}
                        </Badge>
                      </div>
                      <p className="text-xl font-semibold text-primary">
                        {service.cost}
                      </p>
                      
                      {/* Action Buttons */}
                      <div className="flex gap-2 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleEditClick(service)}
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDeleteClick(service._id, service.name)}
                          disabled={deletingServiceId === service._id}
                        >
                          {deletingServiceId === service._id ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Trash2 className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Confirm Delete
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>"{serviceToDelete?.name}"</strong>?
              <br />
              <span className="text-red-600 font-medium">This action cannot be undone.</span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 sm:gap-2">
            <Button
              variant="outline"
              onClick={handleCancelDelete}
              disabled={!!deletingServiceId}
            >
              Decline
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={!!deletingServiceId}
              className="flex items-center gap-2"
            >
              {deletingServiceId ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4" />
                  Accept
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BarberServices;
