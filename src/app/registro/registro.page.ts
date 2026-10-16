
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import {
  FormGroup,
  FormControl,
  Validators,
  ReactiveFormsModule,
  AbstractControl,
  ValidationErrors
} from '@angular/forms';

import { jsPDF } from 'jspdf';

import { IonHeader } from '@ionic/angular/ion-header';
import { IonToolbar } from '@ionic/angular/ion-toolbar';
import { IonTitle } from '@ionic/angular/ion-title';
import { IonContent } from '@ionic/angular/ion-content';
import { IonButtons } from '@ionic/angular/ion-buttons';
import { IonButton } from '@ionic/angular/ion-button';
import { IonIcon } from '@ionic/angular/ion-icon';

import { addIcons } from 'ionicons';
import { sunnyOutline, moonOutline } from 'ionicons/icons';

// Fecha de hoy en formato YYYY-MM-DD
function obtenerFechaActual(): string {
  const hoy = new Date();

  return hoy.getFullYear() + '-' +
    String(hoy.getMonth() + 1).padStart(2, '0') + '-' +
    String(hoy.getDate()).padStart(2, '0');
}

// Validador para impedir fechas futuras
function validarFecha(
  control: AbstractControl
): ValidationErrors | null {

  if (!control.value) return null;

  return control.value > obtenerFechaActual()
    ? { fechaFutura: true }
    : null;
}

@Component({
  selector: 'app-registro',
  templateUrl: 'registro.page.html',
  styleUrls: ['registro.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButtons,
    IonButton,
    IonIcon
  ]
})
export class RegistroPage {

  modoOscuro = document.documentElement.classList.contains(
    'ion-palette-dark'
  );

  // Guardar datos del último formulario enviado
  datosEnviados: {
    nombre: string;
    email: string;
    fechaNacimiento: string;
  } | null = null;

  // Formulario reactivo
  formulario = new FormGroup({

    nombre: new FormControl('', [
      Validators.required,
      Validators.minLength(3)
    ]),

    email: new FormControl('', [
      Validators.required,
      Validators.email
    ]),

    password: new FormControl('', [
      Validators.required,
      Validators.minLength(6)
    ]),

    fechaNacimiento: new FormControl('', [
      Validators.required,
      validarFecha
    ])
  });

  constructor() {
    addIcons({ sunnyOutline, moonOutline });
  }

  // Fecha máxima seleccionable
  get fechaMaxima(): string {
    return obtenerFechaActual();
  }

  // Cambiar el tema
  cambiarModoOscuro() {
    this.modoOscuro = !this.modoOscuro;

    document.documentElement.classList.toggle(
      'ion-palette-dark',
      this.modoOscuro
    );
  }

  // Hash de demostración: sal aleatoria + SHA-256
  async generarHash(password: string) {

    const sal = crypto.getRandomValues(new Uint8Array(16));

    const salHex = Array.from(sal)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    const bytes = new TextEncoder().encode(
      salHex + ':' + password
    );

    const resultado = await crypto.subtle.digest(
      'SHA-256',
      bytes
    );

    const hash = Array.from(new Uint8Array(resultado))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    return { hash, sal: salHex };
  }

  // Enviar formulario
  async enviarFormulario() {

    this.formulario.get('fechaNacimiento')
      ?.updateValueAndValidity();

    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    const datos = this.formulario.getRawValue();

    const resultado = await this.generarHash(
      datos.password ?? ''
    );

    this.datosEnviados = {
      nombre: datos.nombre ?? '',
      email: datos.email ?? '',
      fechaNacimiento: datos.fechaNacimiento ?? ''
    };

    // Nunca imprimimos la contraseña original
    console.log('Registro reactivo:', {
      ...this.datosEnviados,
      passwordHash: resultado.hash,
      sal: resultado.sal
    });

    alert('Formulario enviado correctamente');
  }

  // Descargar PDF
  descargarPDF() {

    if (!this.datosEnviados) return;

    const pdf = new jsPDF();

    pdf.setFontSize(18);
    pdf.text('Registro de Usuario', 20, 25);

    pdf.setFontSize(12);

    pdf.text(
      'Nombre: ' + this.datosEnviados.nombre,
      20, 45
    );

    pdf.text(
      'Correo: ' + this.datosEnviados.email,
      20, 60
    );

    pdf.text(
      'Fecha de nacimiento: ' +
      this.datosEnviados.fechaNacimiento,
      20, 75
    );

    // No se incluye la contraseña en el PDF
    pdf.save('registro-reactivo.pdf');
  }
}
