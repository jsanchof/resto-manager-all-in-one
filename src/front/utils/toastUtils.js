import { toast } from 'react-hot-toast';

export const showSuccess = (message = "Operación exitosa") => {
    toast.success(message);
};

export const showError = (message = "Ocurrió un error") => {
    toast.error(message);
};

export const showInfo = (message = "Información") => {
    toast(message); // por defecto es neutro
};

export const showLoading = (message = "Cargando...") => {
    return toast.loading(message);
};

export const dismissToast = (toastId) => {
    toast.dismiss(toastId);
};
