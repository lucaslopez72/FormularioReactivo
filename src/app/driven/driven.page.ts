
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
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

@Component({
  selector: 'app-driven',
  templateUrl: 'driven.page.html',
  styleUrls: ['driven.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButtons,
    IonButton,
    IonIcon
  ]
})
export class DrivenPage {

  modoOscuro = document.documentElement.classList.contains(
    'ion-palette-dark'
  );

  // Modelo conectado al HTML con ngModel
  usuario = {
    nombre: '',
    email: '',
    password: '',
    fechaNacimiento: ''
  };

  // Datos del último envío
  datosEnviados: {
    nombre: string;
    email: string;
    fechaNacimiento: string;
  } | null = null;

  constructor() {
    addIcons({ sunnyOutline, moonOutline });
  }

  // Obtener fecha actual
  get fechaMaxima(): string {
    const hoy = new Date();

    return hoy.getFullYear() + '-' +
      String(hoy.getMonth() + 1).padStart(2, '0') + '-' +
      String(hoy.getDate()).padStart(2, '0');
  }

  // Comprobar que la fecha no sea futura
  get fechaFutura(): boolean {
    return this.usuario.fechaNacimiento > this.fechaMaxima;
  }

  // Activar/desactivar modo oscuro
  cambiarModoOscuro() {
    this.modoOscuro = !this.modoOscuro;

    document.documentElement.classList.toggle(
      'ion-palette-dark',
      this.modoOscuro
    );
  }

  // Generar hash con sal aleatoria
  async generarHash(password: string) {

    const sal = crypto.getRandomValues(
      new Uint8Array(16)
    );

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

  // Enviar formulario Template-Driven
  async enviarFormulario() {

    // Comprobación adicional de datos
    if (
      this.usuario.nombre.trim().length < 3 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        this.usuario.email
      ) ||
      this.usuario.password.length < 6 ||
      !this.usuario.fechaNacimiento ||
      this.fechaFutura
    ) {
      return;
    }

    const resultado = await this.generarHash(
      this.usuario.password
    );

    this.datosEnviados = {
      nombre: this.usuario.nombre,
      email: this.usuario.email,
      fechaNacimiento: this.usuario.fechaNacimiento
    };

    // Nunca se imprime la contraseña original
    console.log('Registro Template-Driven:', {
      ...this.datosEnviados,
      passwordHash: resultado.hash,
      sal: resultado.sal
    });

    alert('Formulario enviado correctamente');
  }

  // Descargar PDF
  descargarPDF() {

    if (!this.datosEnviados) {
      return;
    }

    const pdf = new jsPDF();

    pdf.setFontSize(18);
    pdf.text('Registro Template-Driven', 20, 25);

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

    pdf.save('registro-driven.pdf');
  }
}
