# Implementación del Backend - Sistema Municipal

## Funcionalidades Implementadas
1. **Descarga de Documentos de Postulantes Seleccionados**
2. **Sistema de Notificaciones por Correo**
   - Aprobación de postulaciones
   - Rechazo de postulaciones con motivo opcional

---

## PARTE 1: Descarga de Documentos de Postulantes Seleccionados

## 1. Agregar el nuevo DTO

Crear o actualizar el archivo `src/formularios/dto/descargar-documentos-postulantes.dto.ts`:

```typescript
export class DescargarDocumentosPostulantesDto {
  formularioId: number;
  postulanteIds: number[];
}
```

## 2. Actualizar el Controller de Formularios

Agregar al archivo `src/formularios/formularios.controller.ts`:

```typescript
@Post('descargar-postulantes')
async descargarDocumentosPostulantes(
  @Body() descargarDto: DescargarDocumentosPostulantesDto,
  @Res() res: Response
) {
  try {
    const resultado = await this.formulariosService.descargarDocumentosPostulantes(descargarDto);
    
    // Generar nombre del archivo con fecha
    const fechaActual = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const nombreArchivo = `PostulantesSeleccionados${fechaActual}.zip`;
    
    res.set({
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="${nombreArchivo}"`,
      'Content-Length': resultado.buffer.length,
    });
    
    res.status(HttpStatus.OK).send(resultado.buffer);
  } catch (error) {
    console.error('Error en endpoint descargar-postulantes:', error);
    
    if (error.name === 'NotFoundException') {
      res.status(HttpStatus.NOT_FOUND).json({
        message: error.message,
        error: 'No se encontraron documentos para los postulantes seleccionados'
      });
    } else {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Error al generar el archivo de descarga',
        error: error.message
      });
    }
  }
}
```

## 3. Actualizar el Service de Formularios

Agregar al archivo `src/formularios/formularios.service.ts`:

```typescript
async descargarDocumentosPostulantes(descargarDto: DescargarDocumentosPostulantesDto): Promise<{ buffer: Buffer; esMultiple: boolean }> {
  try {
    const { formularioId, postulanteIds } = descargarDto;
    console.log(`Descargando documentos para formulario ${formularioId} de postulantes: ${postulanteIds.join(', ')}`);
    
    // Verificar que el formulario existe
    const formulario = await this.formularioRepository.findOne({
      where: { formularioID: formularioId }
    });
    
    if (!formulario) {
      throw new NotFoundException(`Formulario con ID ${formularioId} no encontrado`);
    }
    
    // Obtener fecha actual para el nombre del archivo
    const fechaActual = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const nombreArchivoPrincipal = `PostulantesSeleccionados_${formulario.cargo.replace(/\s+/g, '_')}_${fechaActual}`;
    
    // Crear el ZIP con los postulantes seleccionados
    const buffer = await this.crearZipPostulantesSeleccionados(formularioId, postulanteIds, nombreArchivoPrincipal);
    return { buffer, esMultiple: true };

  } catch (error) {
    console.error('Error en descargarDocumentosPostulantes:', error);
    throw error;
  }
}

private async crearZipPostulantesSeleccionados(formularioId: number, postulanteIds: number[], nombreArchivoPrincipal: string): Promise<Buffer> {
  return new Promise(async (resolve, reject) => {
    try {
      const archivePrincipal = archiver('zip', { zlib: { level: 9 } });
      const chunks: Buffer[] = [];

      archivePrincipal.on('data', (chunk) => chunks.push(chunk));
      archivePrincipal.on('end', () => {
        console.log(`ZIP de postulantes seleccionados creado exitosamente: ${nombreArchivoPrincipal}.zip`);
        resolve(Buffer.concat(chunks));
      });
      archivePrincipal.on('error', (err) => {
        console.error('Error al crear ZIP de postulantes seleccionados:', err);
        reject(err);
      });

      console.log(`\n=== Procesando postulantes seleccionados del formulario ${formularioId} ===`);
      
      // Buscar solo los postulantes seleccionados de esta postulación
      const postulantes = await this.postulanteRepository.find({
        where: { 
          formulario_id: formularioId,
          postulanteID: In(postulanteIds)
        },
        relations: ['documentos', 'formulario']
      });

      if (postulantes.length === 0) {
        throw new NotFoundException(`No se encontraron postulantes seleccionados para el formulario ${formularioId}`);
      }

      console.log(`Se encontraron ${postulantes.length} postulantes seleccionados de ${postulanteIds.length} solicitados`);

      // Contar documentos total
      const totalDocumentos = postulantes.reduce((total, postulante) => total + postulante.documentos.length, 0);
      console.log(`Total de documentos encontrados: ${totalDocumentos}`);

      if (totalDocumentos === 0) {
        throw new NotFoundException('Los postulantes seleccionados no tienen documentos adjuntos');
      }

      // Crear ZIP para esta selección de postulantes
      const nombreFormulario = postulantes[0].formulario?.cargo || `Formulario_${formularioId}`;
      const zipPostulantes = await this.crearZipPorPostulacion(postulantes, `${nombreFormulario}_Seleccionados`);
      
      // Agregar el ZIP al archivo principal
      archivePrincipal.append(zipPostulantes, { name: `${nombreFormulario}_Seleccionados.zip` });
      console.log(`ZIP de postulantes seleccionados agregado: ${nombreFormulario}_Seleccionados.zip`);

      archivePrincipal.finalize();
      
    } catch (error) {
      console.error('Error en crearZipPostulantesSeleccionados:', error);
      reject(error);
    }
  });
}
```

## 4. Importaciones necesarias

Asegúrate de que tengas estas importaciones en el service:

```typescript
import { In } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
```

## Resumen de la implementación:

1. **Nuevo DTO**: Define la estructura de datos para recibir el ID del formulario y los IDs de postulantes seleccionados
2. **Nuevo endpoint**: `/formularios/descargar-postulantes` que maneja la descarga específica
3. **Lógica específica**: Filtra solo los postulantes seleccionados del formulario específico
4. **Reutilización de código**: Usa los métodos existentes `crearZipPorPostulacion` pero con datos filtrados
5. **Validaciones**: Verifica que el formulario exista y que haya documentos disponibles
6. **Nombres descriptivos**: Los archivos ZIP generados indican claramente que son de "postulantes seleccionados"

Esta implementación es más eficiente que la anterior porque:
- Solo consulta los postulantes específicos seleccionados
- Mantiene la estructura de ZIP organizada
- Reutiliza la lógica existente
- Proporciona mensajes de error específicos

---

## PARTE 2: Sistema de Notificaciones por Correo

### 1. Crear DTOs para notificaciones

Crear el archivo `src/formularios/dto/notificaciones-correo.dto.ts`:

```typescript
export class EnviarAprobacionesDto {
  formularioId: number;
  postulanteIds: number[];
}

export class EnviarRechazosDto {
  formularioId: number;
  postulanteIds: number[];
  motivo?: string;
}

export class CorreoRespuesta {
  enviados: number;
  fallidos: number;
  detalles: {
    postulanteId: number;
    email: string;
    estado: 'enviado' | 'fallido';
    error?: string;
  }[];
}
```

### 2. Crear el servicio de correos

Crear el archivo `src/correos/correos.service.ts`:

```typescript
import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { Postulante } from '../postulantes/entities/postulante.entity';
import { Formulario } from '../formularios/entities/formulario.entity';

@Injectable()
export class CorreosService {
  private readonly logger = new Logger(CorreosService.name);

  constructor(private mailerService: MailerService) {}

  async enviarCorreoAprobacion(
    postulante: Postulante, 
    formulario: Formulario,
    municipio: string = 'Municipalidad'
  ): Promise<boolean> {
    try {
      const asunto = `🎉 ¡Felicitaciones! Tu postulación ha sido aprobada - ${formulario.cargo}`;
      
      const contenidoHtml = `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="background: linear-gradient(135deg, #1976D2, #42A5F5); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 24px;">🏛️ ${municipio}</h1>
            <h2 style="margin: 10px 0; font-size: 20px;">¡Tu postulación ha sido aprobada!</h2>
          </div>
          
          <div style="background: white; padding: 30px; border: 1px solid #e0e0e0;">
            <h3 style="color: #1976D2; margin-top: 0;">Estimado/a ${postulante.nombres} ${postulante.apellidoPaterno},</h3>
            
            <p style="font-size: 16px; margin: 20px 0;">
              Nos complace informarte que tu postulación para el cargo de <strong>${formulario.cargo}</strong> 
              ha sido <span style="color: #4CAF50; font-weight: bold;">APROBADA</span>.
            </p>
            
            <div style="background: #E8F5E8; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4CAF50;">
              <h4 style="color: #2E7D32; margin-top: 0;">📋 Próximos pasos a seguir:</h4>
              <ol style="margin: 10px 0;">
                <li>Mantente atento a tu correo electrónico para comunicaciones adicionales</li>
                <li>Prepara la documentación adicional que pueda ser requerida</li>
                <li>Espera las instrucciones para las siguientes etapas del proceso</li>
                <li>En caso de dudas, contacta con nosotros usando la información de contacto</li>
              </ol>
            </div>
            
            <div style="background: #F5F5F5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h4 style="color: #1976D2; margin-top: 0;">📞 Información de contacto:</h4>
              <p style="margin: 5px 0;"><strong>Correo:</strong> contacto@municipalidad.cl</p>
              <p style="margin: 5px 0;"><strong>Teléfono:</strong> (56) 2 2345 6789</p>
              <p style="margin: 5px 0;"><strong>Horario de atención:</strong> Lunes a Viernes, 08:30 - 17:30 hrs</p>
            </div>
            
            <div style="background: #E3F2FD; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h4 style="color: #1976D2; margin-top: 0;">📅 Fechas importantes:</h4>
              <p style="margin: 5px 0;"><strong>Período de postulación:</strong> ${this.formatearFecha(formulario.fechaInicio)} - ${this.formatearFecha(formulario.fechaTermino)}</p>
              <p style="margin: 5px 0;"><strong>Fecha de aprobación:</strong> ${this.formatearFecha(new Date())}</p>
            </div>
            
            <p style="margin: 30px 0 20px 0; text-align: center; font-style: italic; color: #666;">
              ¡Felicitaciones nuevamente y muchos éxitos en esta nueva etapa!
            </p>
          </div>
          
          <div style="background: #1976D2; color: white; padding: 20px; text-align: center; border-radius: 0 0 10px 10px;">
            <p style="margin: 0; font-size: 14px;">
              Este es un correo automático, por favor no responder directamente.<br>
              Para consultas utiliza los canales de contacto oficiales.
            </p>
          </div>
        </div>
      `;

      await this.mailerService.sendMail({
        to: postulante.email,
        subject: asunto,
        html: contenidoHtml,
      });

      this.logger.log(`Correo de aprobación enviado exitosamente a: ${postulante.email}`);
      return true;
    } catch (error) {
      this.logger.error(`Error enviando correo de aprobación a ${postulante.email}:`, error);
      return false;
    }
  }

  async enviarCorreoRechazo(
    postulante: Postulante, 
    formulario: Formulario,
    motivo?: string,
    municipio: string = 'Municipalidad'
  ): Promise<boolean> {
    try {
      const asunto = `Resultado de tu postulación - ${formulario.cargo}`;
      
      const contenidoHtml = `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="background: linear-gradient(135deg, #757575, #9E9E9E); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 24px;">🏛️ ${municipio}</h1>
            <h2 style="margin: 10px 0; font-size: 20px;">Resultado de tu postulación</h2>
          </div>
          
          <div style="background: white; padding: 30px; border: 1px solid #e0e0e0;">
            <h3 style="color: #1976D2; margin-top: 0;">Estimado/a ${postulante.nombres} ${postulante.apellidoPaterno},</h3>
            
            <p style="font-size: 16px; margin: 20px 0;">
              Agradecemos tu interés en participar en el proceso de postulación para el cargo de 
              <strong>${formulario.cargo}</strong>.
            </p>
            
            <p style="font-size: 16px; margin: 20px 0;">
              Después de una cuidadosa evaluación, lamentamos informarte que en esta ocasión 
              tu postulación <span style="color: #F44336; font-weight: bold;">no ha sido seleccionada</span> 
              para continuar en el proceso.
            </p>
            
            ${motivo ? `
            <div style="background: #FFF3E0; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #FF9800;">
              <h4 style="color: #E65100; margin-top: 0;">📝 Observaciones:</h4>
              <p style="margin: 0; font-style: italic;">${motivo}</p>
            </div>
            ` : ''}
            
            <div style="background: #E8F5E8; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4CAF50;">
              <h4 style="color: #2E7D32; margin-top: 0;">💪 Te animamos a:</h4>
              <ul style="margin: 10px 0;">
                <li>Seguir participando en futuros procesos de postulación</li>
                <li>Continuar desarrollando tus competencias profesionales</li>
                <li>Mantener tu perfil actualizado para próximas oportunidades</li>
                <li>Contactarnos si tienes dudas sobre el proceso</li>
              </ul>
            </div>
            
            <div style="background: #F5F5F5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h4 style="color: #1976D2; margin-top: 0;">📞 Información de contacto:</h4>
              <p style="margin: 5px 0;"><strong>Correo:</strong> contacto@municipalidad.cl</p>
              <p style="margin: 5px 0;"><strong>Teléfono:</strong> (56) 2 2345 6789</p>
              <p style="margin: 5px 0;"><strong>Horario de atención:</strong> Lunes a Viernes, 08:30 - 17:30 hrs</p>
            </div>
            
            <p style="margin: 30px 0 20px 0; text-align: center; font-weight: bold; color: #1976D2;">
              ¡Agradecemos sinceramente tu participación y te deseamos el mayor de los éxitos!
            </p>
          </div>
          
          <div style="background: #757575; color: white; padding: 20px; text-align: center; border-radius: 0 0 10px 10px;">
            <p style="margin: 0; font-size: 14px;">
              Este es un correo automático, por favor no responder directamente.<br>
              Para consultas utiliza los canales de contacto oficiales.
            </p>
          </div>
        </div>
      `;

      await this.mailerService.sendMail({
        to: postulante.email,
        subject: asunto,
        html: contenidoHtml,
      });

      this.logger.log(`Correo de rechazo enviado exitosamente a: ${postulante.email}`);
      return true;
    } catch (error) {
      this.logger.error(`Error enviando correo de rechazo a ${postulante.email}:`, error);
      return false;
    }
  }

  private formatearFecha(fecha: Date | string): string {
    const fechaObj = typeof fecha === 'string' ? new Date(fecha) : fecha;
    return fechaObj.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}
```

### 3. Actualizar el Controller de Formularios

Agregar estos endpoints al `FormulariosController`:

```typescript
@Post('enviar-aprobaciones')
async enviarAprobaciones(@Body() enviarAprobacionesDto: EnviarAprobacionesDto): Promise<CorreoRespuesta> {
  return this.formulariosService.enviarAprobaciones(enviarAprobacionesDto);
}

@Post('enviar-rechazos')
async enviarRechazos(@Body() enviarRechazosDto: EnviarRechazosDto): Promise<CorreoRespuesta> {
  return this.formulariosService.enviarRechazos(enviarRechazosDto);
}
```

### 4. Actualizar el Service de Formularios

Agregar estos métodos al `FormulariosService`:

```typescript
constructor(
  // ... otras dependencias
  private correosService: CorreosService,
) {}

async enviarAprobaciones(enviarDto: EnviarAprobacionesDto): Promise<CorreoRespuesta> {
  const { formularioId, postulanteIds } = enviarDto;
  
  // Obtener formulario
  const formulario = await this.formularioRepository.findOne({
    where: { formularioID: formularioId }
  });
  
  if (!formulario) {
    throw new NotFoundException(`Formulario con ID ${formularioId} no encontrado`);
  }
  
  // Obtener postulantes
  const postulantes = await this.postulanteRepository.find({
    where: { 
      formulario_id: formularioId,
      postulanteID: In(postulanteIds)
    }
  });
  
  const resultado: CorreoRespuesta = {
    enviados: 0,
    fallidos: 0,
    detalles: []
  };
  
  // Enviar correos
  for (const postulante of postulantes) {
    const exito = await this.correosService.enviarCorreoAprobacion(postulante, formulario);
    
    resultado.detalles.push({
      postulanteId: postulante.postulanteID,
      email: postulante.email,
      estado: exito ? 'enviado' : 'fallido',
      error: exito ? undefined : 'Error al enviar correo'
    });
    
    if (exito) {
      resultado.enviados++;
    } else {
      resultado.fallidos++;
    }
  }
  
  return resultado;
}

async enviarRechazos(enviarDto: EnviarRechazosDto): Promise<CorreoRespuesta> {
  const { formularioId, postulanteIds, motivo } = enviarDto;
  
  // Obtener formulario
  const formulario = await this.formularioRepository.findOne({
    where: { formularioID: formularioId }
  });
  
  if (!formulario) {
    throw new NotFoundException(`Formulario con ID ${formularioId} no encontrado`);
  }
  
  // Obtener postulantes
  const postulantes = await this.postulanteRepository.find({
    where: { 
      formulario_id: formularioId,
      postulanteID: In(postulanteIds)
    }
  });
  
  const resultado: CorreoRespuesta = {
    enviados: 0,
    fallidos: 0,
    detalles: []
  };
  
  // Enviar correos
  for (const postulante of postulantes) {
    const exito = await this.correosService.enviarCorreoRechazo(postulante, formulario, motivo);
    
    resultado.detalles.push({
      postulanteId: postulante.postulanteID,
      email: postulante.email,
      estado: exito ? 'enviado' : 'fallido',
      error: exito ? undefined : 'Error al enviar correo'
    });
    
    if (exito) {
      resultado.enviados++;
    } else {
      resultado.fallidos++;
    }
  }
  
  return resultado;
}
```

### 5. Configuración del módulo de correos

Asegúrate de tener configurado el `@nestjs-modules/mailer` en tu aplicación:

```typescript
// En app.module.ts o el módulo correspondiente
import { MailerModule } from '@nestjs-modules/mailer';

@Module({
  imports: [
    MailerModule.forRoot({
      transport: {
        host: process.env.MAIL_HOST,
        port: parseInt(process.env.MAIL_PORT),
        secure: false,
        auth: {
          user: process.env.MAIL_USERNAME,
          pass: process.env.MAIL_PASSWORD,
        },
      },
      defaults: {
        from: `"Sistema Municipal" <${process.env.MAIL_FROM}>`,
      },
    }),
    // ... otros módulos
  ],
})
export class AppModule {}
```

### 6. Variables de entorno

Agregar al archivo `.env`:

```
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=tu-email@gmail.com
MAIL_PASSWORD=tu-password-de-aplicacion
MAIL_FROM=noreply@municipalidad.cl
```

## Resumen de las nuevas funcionalidades:

### Sistema de Correos:
1. **Correos de Aprobación**: Diseño profesional con pasos a seguir, información de contacto y fechas importantes
2. **Correos de Rechazo**: Diseño empático con motivo opcional y motivación para futuros procesos
3. **Respuesta Detallada**: Información de correos enviados, fallidos y detalles específicos
4. **Manejo de Errores**: Control de errores por correo individual
5. **Plantillas HTML**: Diseño responsive y profesional con colores corporativos

### Características Técnicas:
- **Asíncrono**: Procesa múltiples correos de forma eficiente
- **Robusto**: Manejo individual de errores por correo
- **Escalable**: Fácil de extender para nuevos tipos de notificaciones
- **Configurable**: Fácil personalización por municipalidad
- **Logging**: Registro detallado para auditoría y debug 