import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Ruler, Info, AlertTriangle } from 'lucide-react';

interface MeasurementGuideProps {
  measurement: string;
  value?: number;
  unit: string;
  description: string;
  instructions: string[];
  tips?: string[];
  range: { min: number; max: number };
}

export function MeasurementGuide({ 
  measurement, 
  value, 
  unit, 
  description, 
  instructions, 
  tips,
  range 
}: MeasurementGuideProps) {
  const isOutOfRange = value !== undefined && (value < range.min || value > range.max);
  
  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Ruler className="h-5 w-5 text-blue-600" />
            {measurement}
          </CardTitle>
          <Badge variant="secondary">{unit}</Badge>
        </div>
        <p className="text-sm text-gray-600">{description}</p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Instructions */}
        <div>
          <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
            <Info className="h-4 w-4 text-blue-500" />
            Cómo medir:
          </h4>
          <ol className="text-sm text-gray-700 space-y-1">
            {instructions.map((instruction, index) => (
              <li key={index} className="flex gap-2">
                <span className="font-medium text-blue-600 min-w-[20px]">{index + 1}.</span>
                <span>{instruction}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* Tips */}
        {tips && tips.length > 0 && (
          <div>
            <h4 className="font-medium text-sm mb-2 text-green-700">💡 Consejos:</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              {tips.map((tip, index) => (
                <li key={index} className="flex gap-2">
                  <span className="text-green-600">•</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Range indicator */}
        <div className="bg-gray-50 p-3 rounded">
          <div className="text-xs text-gray-600 mb-1">
            Rango típico: {range.min} - {range.max} {unit}
          </div>
          {value !== undefined && (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Tu medida: {value} {unit}</span>
              {isOutOfRange && (
                <Badge variant="destructive" className="text-xs">
                  Fuera de rango
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Out of range warning */}
        {isOutOfRange && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              Esta medida está fuera del rango típico. Por favor, verifica la medición o 
              consulta con un especialista en bike fitting si la medida es correcta.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}

export const MEASUREMENT_GUIDES = {
  height_cm: {
    measurement: 'Estatura Total',
    unit: 'cm',
    description: 'Altura total del ciclista, medida desde la coronilla hasta el suelo',
    instructions: [
      'Colócate descalzo contra una pared, con los pies juntos',
      'Mantén la cabeza erguida, mirando al frente',
      'Usa una regla o libro para marcar el punto más alto de tu cabeza',
      'Mide la distancia desde el suelo hasta la marca'
    ],
    tips: [
      'Mídete en la mañana para mayor precisión',
      'Asegúrate de que la superficie sea completamente plana'
    ]
  },
  
  inseam_cm: {
    measurement: 'Entrepierna (Inseam)',
    unit: 'cm',
    description: 'Distancia desde la ingle hasta el suelo - crítica para altura del sillín',
    instructions: [
      'Colócate descalzo con la espalda contra una pared',
      'Separa ligeramente las piernas (ancho de cadera)',
      'Usa un libro grueso, colócalo entre las piernas simulando un sillín',
      'Presiona firmemente hacia arriba hasta sentir presión',
      'Marca el nivel superior del libro en la pared',
      'Mide desde esa marca hasta el suelo'
    ],
    tips: [
      'Esta es la medida MÁS IMPORTANTE para el bike fitting',
      'Usa ropa ajustada o shorts de ciclismo',
      'Repite 2-3 veces para confirmar la medida'
    ]
  },

  torso_cm: {
    measurement: 'Longitud de Torso',
    unit: 'cm', 
    description: 'Distancia desde el acromion (hombro) hasta la cresta ilíaca (cadera)',
    instructions: [
      'Siéntate erguido en una silla con respaldo',
      'Localiza el acromion (hueso prominente del hombro)',
      'Localiza la cresta ilíaca (hueso superior de la cadera)',
      'Mide la distancia vertical entre estos dos puntos',
      'Mantén una postura natural, sin forzar la espalda'
    ],
    tips: [
      'Afecta directamente el reach (distancia horizontal al manillar)',
      'Una persona con torso largo necesitará mayor reach'
    ]
  },

  arm_length_cm: {
    measurement: 'Longitud de Brazos',
    unit: 'cm',
    description: 'Distancia desde acromion hasta la muñeca - determina reach y potencia',
    instructions: [
      'Extiende el brazo lateralmente, paralelo al suelo',
      'Localiza el acromion (hueso prominente del hombro)',
      'Mide hasta el hueso de la muñeca (estiloides cubital)',
      'Mantén el brazo relajado, sin tension'
    ],
    tips: [
      'Fundamental para calcular la longitud de potencia necesaria',
      'Brazos largos permiten posiciones más aerodinámicas'
    ]
  },

  shoulder_width_cm: {
    measurement: 'Ancho de Hombros',
    unit: 'cm',
    description: 'Distancia entre acromions - determina ancho óptimo del manillar',
    instructions: [
      'De pie, con postura natural y relajada',
      'Localiza ambos acromions (huesos prominentes de los hombros)',
      'Mide la distancia horizontal entre ambos puntos',
      'Usa una cinta métrica flexible'
    ],
    tips: [
      'El manillar debe ser aproximadamente igual al ancho de hombros',
      'Hombros anchos necesitan manillares más anchos para mayor control'
    ]
  },

  foot_length_cm: {
    measurement: 'Longitud del Pie',
    unit: 'cm',
    description: 'Largo total del pie - útil para posición de calas y zapatillas',
    instructions: [
      'Coloca el pie descalzo sobre una hoja de papel',
      'Marca el punto más posterior del talón',
      'Marca el punto más anterior del dedo más largo',
      'Mide la distancia entre ambas marcas'
    ],
    tips: [
      'Mide el pie más largo si hay diferencia',
      'Ayuda a posicionar correctamente las calas de los pedales'
    ]
  },

  weight_kg: {
    measurement: 'Peso Corporal',
    unit: 'kg',
    description: 'Peso total - influye en presión de neumáticos y análisis de rendimiento',
    instructions: [
      'Pésate en la mañana, después de ir al baño',
      'Usa ropa mínima o siempre la misma ropa',
      'Asegúrate de que la báscula esté en superficie firme',
      'Registra el peso después de que se estabilice'
    ],
    tips: [
      'Para análisis de rendimiento, pésate regularmente',
      'Afecta la presión óptima de neumáticos y componentes'
    ]
  }
};