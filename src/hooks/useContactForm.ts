import { useMemo, useState } from "react";
import { useToast } from "@chakra-ui/react";
import { contactService, type ContactFormData } from "../services/contactService";

const initialFormState: ContactFormData = {
  message: "",
  email: "",
  name: "",
  subject: "",
};

const isValidEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

export const useContactForm = () => {
  const [formData, setFormData] = useState<ContactFormData>(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  const canSubmit = useMemo(() => {
    const nameOk = formData.name.trim().length >= 2;
    const emailOk = isValidEmail(formData.email);
    const subjectOk = formData.subject.trim().length >= 3;
    const messageOk = formData.message.trim().length >= 10;
    return nameOk && emailOk && subjectOk && messageOk;
  }, [formData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => setFormData(initialFormState);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!canSubmit) {
      toast({
        title: "Formulaire incomplet",
        description:
          "Vérifiez vos informations (email valide, sujet et message suffisamment longs).",
        status: "warning",
        duration: 4500,
        isClosable: true,
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const res: any = await contactService.sendContactMessage(formData);

      toast({
        title: "Message envoyé ✅",
        description: res?.message ?? "Votre message a été envoyé avec succès.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });

      resetForm();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description:
          error?.message ||
          error?.response?.message ||
          "Une erreur est survenue lors de l'envoi du message.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    formData,
    isSubmitting,
    canSubmit,
    handleInputChange,
    handleSubmit,
    resetForm,
  };
};
