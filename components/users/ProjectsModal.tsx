"use client"

import type React from "react"
import { collection, addDoc, serverTimestamp, updateDoc, query, where, getDocs, doc } from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
// @ts-ignore
import { db, storage } from "@/lib/firebase"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Archive, Copy, Edit, Eye, FileImage, Loader2, Plus, Trash, Upload, X } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { User } from "@/lib/types"
import Link from "next/link"

interface Project {
  id: string
  name: string
  description: string
  logo: string
  archived: boolean
  createdAt: Date
}

interface ProjectsModalProps {
  isOpen: boolean
  onClose: () => void
  initialProjects?: Project[]
  currentUser: User

  onProjectsChange?: (projects: Project[]) => void
}

export default function ProjectsModal({ isOpen, onClose, currentUser, initialProjects = [], onProjectsChange }: ProjectsModalProps) {
  const { toast } = useToast()
  const [projects, setProjects] = useState<Project[]>(initialProjects)
  const [activeTab, setActiveTab] = useState<string>("open")
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [formState, setFormState] = useState<{
    isVisible: boolean
    isEditing: boolean
    currentId: string | null
    name: string
    description: string
    logo: File | null
    logoPreview: string | null
    errors: {
      name?: string
      description?: string
      logo?: string
    }
  }>({
    isVisible: false,
    isEditing: false,
    currentId: null,
    name: "",
    description: "",
    logo: null,
    logoPreview: null,
    errors: {},
  })
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean
    projectId: string | null
  }>({
    isOpen: false,
    projectId: null,
  })

  // Update parent component when projects change
  useEffect(() => {
    if (onProjectsChange) {
      onProjectsChange(projects)
    }
  }, [projects, onProjectsChange])

  // Function to generate a random ID
  const generateRandomId = () => {
    return `proj_${Math.random().toString(36).substring(2, 15)}`
  }

  const validateForm = () => {
    const errors: {
      name?: string
      description?: string
      logo?: string
    } = {}

    if (!formState.name.trim()) {
      errors.name = "Le nom du projet est requis"
    }

    if (!formState.description.trim()) {
      errors.description = "La description est requise"
    }

    if (!formState.logo && !formState.isEditing) {
      errors.logo = "Un logo est requis"
    }

    setFormState((prev) => ({ ...prev, errors }))
    return Object.keys(errors).length === 0
  }

  const handleCreateProject = async () => {
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const newProject: Project = {
        id: generateRandomId(),
        name: formState.name.trim(),
        description: formState.description.trim(),
        logo: formState.logo ? URL.createObjectURL(formState.logo) : "",
        archived: false,
        createdAt: new Date(),
      };

      // Add project to Firestore
      // @ts-ignore
      const docRef = await addDoc(collection(db, "projects"), {
        name: newProject.name,
        description: newProject.description,
        logo: newProject.logo,
        archived: newProject.archived,
        createdAt: newProject.createdAt,
      });

      newProject.id = docRef.id;
      setProjects((prev) => [newProject, ...prev]);
      resetForm();
      toast({
        title: "Projet créé",
        description: `Le projet "${newProject.name}" a été créé avec succès.`,
      });
    } catch (e) {
      console.error("Error adding document: ", e);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la création du projet.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };


  const handleUpdateProject = async () => {
    if (!validateForm() || !formState.currentId) return;

    setIsLoading(true);

    try {

      // @ts-ignore
      const projectRef = doc(db, "projects", formState.currentId);
      await updateDoc(projectRef, {
        name: formState.name.trim(),
        description: formState.description.trim(),
        logo: formState.logo ? URL.createObjectURL(formState.logo) : "",
      });

      setProjects((prev) =>
        prev.map((project) =>
          project.id === formState.currentId
            ? {
              ...project,
              name: formState.name.trim(),
              description: formState.description.trim(),
              logo: formState.logo ? URL.createObjectURL(formState.logo) : project.logo,
            }
            : project
        )
      );

      resetForm();
      toast({
        title: "Projet mis à jour",
        description: "Le projet a été mis à jour avec succès.",
      });
    } catch (e) {
      console.error("Error updating document: ", e);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la mise à jour du projet.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditProject = (projectId: string) => {
    const projectToEdit = projects.find((project) => project.id === projectId)
    if (projectToEdit) {
      setFormState({
        isVisible: true,
        isEditing: true,
        currentId: projectId,
        name: projectToEdit.name,
        description: projectToEdit.description,
        logo: null,
        logoPreview: projectToEdit.logo,
        errors: {},
      })
    }
  }

  const handleArchiveProject = async (projectId: string) => {
    setIsLoading(true);

    // @ts-ignore
    if (!db || !currentUser) {
      setIsLoading(false);
      return;
    }

    try {
      // Update Firestore project status to archived
      await updateDoc(doc(db, 'projects', projectId), {
        archived: true,
        updatedAt: serverTimestamp(),
        archivedBy: {
          uid: currentUser.uid,
          displayName: currentUser.displayName,
          photoURL: currentUser.photoURL,
          timestamp: serverTimestamp(),
        },
      });

      setProjects((prev) =>
        prev.map((project) =>
          project.id === projectId ? { ...project, archived: true } : project
        )
      );

      setIsLoading(false);

      toast({
        title: "Projet archivé",
        description: "Le projet a été archivé avec succès.",
      });
    } catch (error) {
      setIsLoading(false);
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de l'archivage du projet.",
      });
      console.error("Error archiving project:", error);
    }
  };

  const handleUnarchiveProject = async (projectId: string) => {
    setIsLoading(true);
    // @ts-ignore
    if (!db || !currentUser) {
      setIsLoading(false);
      return;
    }

    try {
      // Update Firestore project status to unarchived
      await updateDoc(doc(db, 'projects', projectId), {
        archived: false,
        updatedAt: serverTimestamp(),
        archivedBy: {
          uid: currentUser.uid,
          displayName: currentUser.displayName,
          photoURL: currentUser.photoURL,
          timestamp: serverTimestamp(),
        },
      });

      setProjects((prev) =>
        prev.map((project) =>
          project.id === projectId ? { ...project, archived: false } : project
        )
      );

      setIsLoading(false);

      toast({
        title: "Projet restauré",
        description: "Le projet a été restauré avec succès.",
      });
    } catch (error) {
      setIsLoading(false);
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de la restauration du projet.",
      });
      console.error("Error restoring project:", error);
    }
  };

  const handleDeleteProject = (projectId: string) => {
    setDeleteConfirm({
      isOpen: true,
      projectId,
    });
  };

  const confirmDeleteProject = async () => {
    // @ts-ignore
    if (!deleteConfirm.projectId || !db || !currentUser) return;

    setIsLoading(true);

    try {
      // Delete the project from Firestore
      await updateDoc(doc(db, 'projects', deleteConfirm.projectId), {
        deleted: true,
        deletedAt: serverTimestamp(),
        deletedBy: {
          uid: currentUser.uid,
          displayName: currentUser.displayName,
          photoURL: currentUser.photoURL,
          timestamp: serverTimestamp(),
        },
      });

      setProjects((prev) => prev.filter((project) => project.id !== deleteConfirm.projectId));
      setDeleteConfirm({ isOpen: false, projectId: null });
      setIsLoading(false);

      toast({
        title: "Projet supprimé",
        description: "Le projet a été définitivement supprimé.",
      });
    } catch (error) {
      setIsLoading(false);
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de la suppression du projet.",
      });
      console.error("Error deleting project:", error);
    }
  };

  const resetForm = () => {
    setFormState({
      isVisible: false,
      isEditing: false,
      currentId: null,
      name: "",
      description: "",
      logo: null,
      logoPreview: null,
      errors: {},
    })
  }

  const copyProjectLink = (projectId: string) => {
    const link = `${window.location.origin}/project/${projectId}/todos`
    navigator.clipboard.writeText(link)

    toast({
      title: "Lien copié",
      description: "Le lien du projet a été copié dans le presse-papier.",
    })
  }

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]

      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        setFormState((prev) => ({
          ...prev,
          errors: {
            ...prev.errors,
            logo: "Le fichier est trop volumineux (max 2MB)",
          },
        }))
        return
      }

      // Validate file type
      if (!file.type.startsWith("image/")) {
        setFormState((prev) => ({
          ...prev,
          errors: {
            ...prev.errors,
            logo: "Seules les images sont acceptées",
          },
        }))
        return
      }

      setFormState((prev) => ({
        ...prev,
        logo: file,
        logoPreview: URL.createObjectURL(file),
        errors: {
          ...prev.errors,
          logo: undefined,
        },
      }))
    }
  }

  const activeProjects = projects.filter((project) => !project.archived)
  const archivedProjects = projects.filter((project) => project.archived)


  useEffect(() => {
    const fetchProjects = async () => {
      setIsLoading(true);
      try {
        // @ts-ignore
        const q = query(collection(db, "projects"), where("archived", "==", false));
        const querySnapshot = await getDocs(q);
        const fetchedProjects: Project[] = [];
        querySnapshot.forEach((doc) => {
          fetchedProjects.push({ id: doc.id, ...doc.data() } as Project);
        });
        setProjects(fetchedProjects);
      } catch (e) {
        console.error("Error fetching projects: ", e);
        toast({
          title: "Erreur",
          description: "Une erreur est survenue lors du chargement des projets.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, []);

  return (
    <>
      <Dialog
        open={isOpen}
        onOpenChange={(open) => {
          if (!open) {
            resetForm()
            onClose()
          }
        }}
      >
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Gérer les projets</DialogTitle>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="open" className="relative">
                Projets en cours
                {activeProjects.length > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                    {activeProjects.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="archived" className="relative">
                Projets archivés
                {archivedProjects.length > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                    {archivedProjects.length}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>

            {/* Ongoing Projects */}
            <TabsContent value="open" className="space-y-4">
              {!formState.isVisible && (
                <Button onClick={() => setFormState((prev) => ({ ...prev, isVisible: true }))} className="w-full">
                  <Plus className="mr-2 h-4 w-4" />
                  Ajouter un projet
                </Button>
              )}

              {formState.isVisible && (
                <Card className="p-4 border border-border/50 shadow-sm">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium">
                      {formState.isEditing ? "Modifier le projet" : "Nouveau projet"}
                    </h3>
                    <Button variant="ghost" size="icon" onClick={resetForm}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="project-name">
                        Nom du projet <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="project-name"
                        value={formState.name}
                        onChange={(e) => setFormState((prev) => ({ ...prev, name: e.target.value }))}
                        placeholder="Nom du projet"
                        className={formState.errors.name ? "border-destructive" : ""}
                      />
                      {formState.errors.name && <p className="text-xs text-destructive">{formState.errors.name}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="project-description">
                        Description <span className="text-destructive">*</span>
                      </Label>
                      <Textarea
                        id="project-description"
                        value={formState.description}
                        onChange={(e) => setFormState((prev) => ({ ...prev, description: e.target.value }))}
                        placeholder="Description du projet"
                        className={formState.errors.description ? "border-destructive" : ""}
                        rows={3}
                      />
                      {formState.errors.description && (
                        <p className="text-xs text-destructive">{formState.errors.description}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="project-logo">
                        Logo {!formState.isEditing && <span className="text-destructive">*</span>}
                      </Label>

                      <div className="flex items-center gap-4">
                        {formState.logoPreview && (
                          <div className="relative h-16 w-16 rounded-md overflow-hidden border border-border">
                            <img
                              src={formState.logoPreview || "/placeholder.svg"}
                              alt="Logo preview"
                              className="h-full w-full object-cover"
                            />
                            <Button
                              variant="destructive"
                              size="icon"
                              className="absolute top-0 right-0 h-5 w-5 rounded-full"
                              onClick={() => setFormState((prev) => ({ ...prev, logo: null, logoPreview: null }))}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        )}

                        <div className="flex-1">
                          <Label
                            htmlFor="logo-upload"
                            className={`flex h-16 cursor-pointer flex-col items-center justify-center rounded-md border border-dashed ${formState.errors.logo
                              ? "border-destructive text-destructive"
                              : "border-border text-muted-foreground"
                              } transition-colors hover:bg-muted/50`}
                          >
                            <div className="flex flex-col items-center justify-center space-y-1 p-3 text-xs">
                              <Upload className="h-4 w-4" />
                              <span>Cliquez pour télécharger</span>
                              <span className="text-[10px]">SVG, PNG, JPG (max 2MB)</span>
                            </div>
                            <Input
                              id="logo-upload"
                              type="file"
                              onChange={handleLogoChange}
                              accept="image/*"
                              className="sr-only"
                            />
                          </Label>
                          {formState.errors.logo && (
                            <p className="text-xs text-destructive mt-1">{formState.errors.logo}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <Button variant="outline" onClick={resetForm} disabled={isLoading}>
                        Annuler
                      </Button>
                      <Button
                        onClick={formState.isEditing ? handleUpdateProject : handleCreateProject}
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            {formState.isEditing ? "Mise à jour..." : "Création..."}
                          </>
                        ) : formState.isEditing ? (
                          "Mettre à jour"
                        ) : (
                          "Créer"
                        )}
                      </Button>
                    </div>
                  </div>
                </Card>
              )}

              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                {activeProjects.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <FileImage className="h-12 w-12 text-muted-foreground/50 mb-3" />
                    <h3 className="text-lg font-medium">Aucun projet en cours</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Créez votre premier projet en cliquant sur le bouton ci-dessus
                    </p>
                  </div>
                ) : (
                  activeProjects.map((project) => (
                    <ProjectCard
                      key={project.id}
                      project={project}
                      onEdit={() => handleEditProject(project.id)}
                      onArchive={() => handleArchiveProject(project.id)}
                      onCopyLink={() => copyProjectLink(project.id)}
                      isLoading={isLoading}
                    />
                  ))
                )}
              </div>
            </TabsContent>

            {/* Archived Projects */}
            <TabsContent value="archived" className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
              {archivedProjects.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Archive className="h-12 w-12 text-muted-foreground/50 mb-3" />
                  <h3 className="text-lg font-medium">Aucun projet archivé</h3>
                  <p className="text-sm text-muted-foreground mt-1">Les projets archivés apparaîtront ici</p>
                </div>
              ) : (
                archivedProjects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    isArchived
                    onUnarchive={() => handleUnarchiveProject(project.id)}
                    onDelete={() => handleDeleteProject(project.id)}
                    isLoading={isLoading}
                  />
                ))
              )}
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={deleteConfirm.isOpen}
        onOpenChange={(open) => setDeleteConfirm((prev) => ({ ...prev, isOpen: open }))}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Le projet sera définitivement supprimé.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteProject}
              disabled={isLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Suppression...
                </>
              ) : (
                "Supprimer"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

interface ProjectCardProps {
  project: Project
  isArchived?: boolean
  isLoading?: boolean
  onEdit?: () => void
  onArchive?: () => void
  onUnarchive?: () => void
  onDelete?: () => void
  onCopyLink?: () => void
}

function ProjectCard({
  project,
  isArchived = false,
  isLoading = false,
  onEdit,
  onArchive,
  onUnarchive,
  onDelete,
  onCopyLink,
}: ProjectCardProps) {
  return (
    <Card className="flex justify-between items-center p-3 transition-all hover:shadow-md">
      <div className="flex items-center space-x-3">
        <div className="h-10 w-10 rounded-md overflow-hidden border border-border flex-shrink-0 bg-muted">
          {project.logo ? (
            <img
              src={project.logo || "/placeholder.svg"}
              alt={`${project.name} logo`}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center bg-primary/10">
              <FileImage className="h-5 w-5 text-primary/50" />
            </div>
          )}
        </div>
        <div>
          <p className="font-medium line-clamp-1">{project.name}</p>
          <p className="text-xs text-muted-foreground line-clamp-1">{project.description}</p>
        </div>
      </div>
      <div className="flex space-x-1">
        {!isArchived ? (
          <>
            {onEdit && (
              <Button
                size="icon"
                variant="ghost"
                onClick={onEdit}
                disabled={isLoading}
                className="h-8 w-8"
                title="Modifier"
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
            {onArchive && (
              <Button
                size="icon"
                variant="ghost"
                onClick={onArchive}
                disabled={isLoading}
                className="h-8 w-8"
                title="Archiver"
              >
                <Archive className="h-4 w-4" />
              </Button>
            )}
            <Link href={`/project/${project.id}/todos`} >
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8"
                title="Voir les todos"
              >
                <Eye className="h-4 w-4" />
              </Button>
            </Link>
            {onCopyLink && (
              <Button
                size="icon"
                variant="ghost"
                onClick={onCopyLink}
                disabled={isLoading}
                className="h-8 w-8"
                title="Copier le lien"
              >
                <Copy className="h-4 w-4" />
              </Button>
            )}
          </>
        ) : (
          <>
            {onUnarchive && (
              <Button
                size="icon"
                variant="ghost"
                onClick={onUnarchive}
                disabled={isLoading}
                className="h-8 w-8"
                title="Restaurer"
              >
                <Archive className="h-4 w-4 text-primary" />
              </Button>
            )}
            {onDelete && (
              <Button
                size="icon"
                variant="ghost"
                onClick={onDelete}
                disabled={isLoading}
                className="h-8 w-8 text-destructive hover:text-destructive"
                title="Supprimer définitivement"
              >
                <Trash className="h-4 w-4" />
              </Button>
            )}
          </>
        )}
      </div>
    </Card>
  )
}

