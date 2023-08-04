import Swal, { SweetAlertIcon, SweetAlertPosition } from "sweetalert2";

enum AlertModalIcon {
  WARNING = "warning",
  ERROR = "error",
  SUCCESS = "success",
  INFO = "info",
  QUESTION = "question",
}

interface IConfirm {
  title?: string;
  text?: string;
  icon?: SweetAlertIcon | undefined;
  confirmButtonText?: string;
  cancelButtonText?: string;
  responseCancelTitle?: string;
  responseCancelText?: string;
  cancelIcon?: SweetAlertIcon | undefined;
  onConfirm(): any | Promise<any>;
  //   onCancel(): any | Promise<any>;
}

interface IPositioned {
  title?: string;
  icon?: SweetAlertIcon | undefined;
  position?: SweetAlertPosition | undefined;
  timer?: number;
}

class AlertModal {
  public confirmation = (props: IConfirm) => {
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton:
          "border p-1 px-3 bg-[#27a844] rounded-md ml-2 text-white",
        cancelButton: "border p-1 px-3 bg-[#dc3546] rounded-md text-white",
      },
      buttonsStyling: false,
    });

    swalWithBootstrapButtons
      .fire({
        title: props.title ? props.title : "Are you sure?",
        text: props.text ? props.text : "You won't be able to revert this!",
        icon: props.icon ? props.icon : AlertModalIcon.WARNING,
        showCancelButton: true,
        confirmButtonText: props.confirmButtonText
          ? props.confirmButtonText
          : "Yes, delete it!",
        cancelButtonText: props.cancelButtonText
          ? props.cancelButtonText
          : "No, cancel!",
        reverseButtons: true,
      })
      .then((result) => {
        if (result.isConfirmed) {
          props.onConfirm();
        } else if (
          /* Read more about handling dismissals below */
          result.dismiss === Swal.DismissReason.cancel
        ) {
          swalWithBootstrapButtons.fire(
            props.responseCancelTitle ? props.responseCancelTitle : "Cancelled",
            props.responseCancelText
              ? props.responseCancelText
              : "Your imaginary file is safe :)",
            props.cancelIcon ? props.cancelIcon : AlertModalIcon.ERROR
          );
        }
      });
  };

  public positioned = (props: IPositioned) => {
    Swal.fire({
      position: props.position ?? "top-end",
      icon: props.icon ?? AlertModalIcon.SUCCESS,
      title: props.title ?? "Your work has been saved",
      showConfirmButton: false,
      timer: props.timer ?? 1500,
    });
  };

  public Default = (props: {
    title?: string;
    text?: string;
    icon?: SweetAlertIcon | undefined;
  }) => {
    Swal.fire(
      props.title ?? "Deleted!",
      props.text ?? "Your file has been deleted.",
      props.icon ?? "success"
    );
  };
}

export default new AlertModal();
