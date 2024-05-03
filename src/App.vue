<script setup>
import { computed, ref } from 'vue';
import JsBarcode from 'jsbarcode';
import addDays from 'date-fns/addDays';
const identifierPrefix = ref(0);
const referenceLenght = ref(8);
const referenceValue = ref('000000000');
const amountValue = ref(0);
const amountLenght = ref(8);
const codeDaysLifetime = ref(1);
const amountDigit = 0;
const canvas = ref(null);

async function generateBarCode() {
  /* const canvas = createCanvas(400, 100);
  const ctx = canvas.getContext('2d');
  ctx.font = 'bold 20px Arial';

  JsBarcode(canvas, getCompleteCode(data), {
      format: "CODE128",
      height: 60,
      displayValue: true
  });

  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(outputPath, buffer); */
  const can = canvas.value;/* document.getElementById('barcodeCanvas'); */
  if (!can) {
    console.error('Canvas element not found!');
    return;
  }

  JsBarcode(can, getBarCode(true), {
    format: "CODE128",
    height: 60,
    displayValue: true
  });
}

/* 
const getCompleteCode = () => {
  const 
  return getBarCode(code);
}
 */
const getDate = (toCode = false) => {
  const today = new Date();
  const days = codeDaysLifetime.value.toString();
  const expiredDate = addDays(today, parseInt(days));
  return toCode ? expiredDate.toISOString().slice(0, 10).replace(/-/g, '') : expiredDate.toLocaleDateString();
}

const getCompleteReference = (reference) => {
  return reference.padStart(referenceLenght, '0');
}

const getformatedAmount = (amount) => {
  const amountString = amount.toString();
  let formated = '';
  if (!amountString.includes('.')) {
    formated = amountString + '00';
  } else {
    formated = amountString.replace('.', '');
  }
  return formated.padStart(amountLenght, '0');
}

const getBarCode = (fullCode = false) => {
  const code = identifierPrefix.value + getCompleteReference(referenceValue.value) + getDate(true) + getformatedAmount(amountValue.value);
  let sum = 0;
  let isEven = true;

  for (let i = code.length - 1; i >= 0; i--) {
    const digit = parseInt(code[i]);
    const multiplier = isEven ? 2 : 1;
    let res = digit * multiplier;

    if (res > 9) {
      res -= 9;
    }

    sum += res;
    isEven = !isEven;
  }

  const digit = (10 - (sum % 10)) % 10;

  return fullCode ? code + digit : digit;
}

const overLength = computed(() => {
  const code = getBarCode(true);
  const count = referenceLenght.value + amountLenght.value + 2 + 8 + 1;
  return code.length > count ? code.length : count
});
const belowLength = computed(() => {
  const code = getBarCode(true);
  const count = referenceLenght.value + amountLenght.value + 2 + 8 + 1;
  return code.length < count ? code.length : count
});
</script>

<template>
  <div class="flex items-center w-full h-screen">
    <v-card class="mx-auto" width="800" height="800">
      <v-card-title primary-title>
        <div>
          <h3 class="headline mb-0">Parametros</h3>
        </div>
      </v-card-title>
      <v-card-text>
        <v-container fluid>
          <v-row>
            <v-text-field @input="generateBarCode" v-model="identifierPrefix" type="number"
              label="Prefijo identificador" counter :maxlength="2">
              <template v-slot:append>
                <v-btn variant="text">
                  ?
                  <v-tooltip activator="parent" location="top">Son las dos primeras posiciones del código y se utiliza
                    como identificador del servicio que
                    se está cobrando. Es asignado por la categoría de servicios de Cadena Comercial OXXO.</v-tooltip>
                </v-btn>
              </template>

            </v-text-field>
          </v-row>
          <v-row>
            <v-divider :thickness="1" class="border-opacity-100"></v-divider>
          </v-row>
          <v-row>
            <v-col cols="12">
              <div class="flex gap-3 space-y-2">
                <div class="mt-3">
                  <v-text-field @input="generateBarCode" v-model="referenceValue" type="number" label="Referencia"
                    counter :maxlength="referenceLenght">
                    <template v-slot:append>
                      <v-btn variant="text">
                        ?
                        <v-tooltip activator="parent" location="top">Identificador del cliente. Se rellena con ceros las
                          posiciones faltantes.</v-tooltip>
                      </v-btn>
                    </template>

                  </v-text-field>
                </div>
                <v-slider label="Longitud" v-model="referenceLenght" :max="12" :min="1" class="align-center" step="1"
                  hide-details>
                  <template v-slot:append>
                    <v-text-field v-model="referenceLenght" density="compact" style="width: 70px" type="number"
                      hide-details single-line></v-text-field>
                  </template>
                </v-slider>
              </div>
            </v-col>
            <!--      {{ overLength }} -->
          </v-row>

          <v-row>
            <v-divider :thickness="1" class="border-opacity-100"></v-divider>
          </v-row>
          <v-row>
            <v-col>
              <div class="">
                <v-text-field @input="generateBarCode" v-model="codeDaysLifetime" type="number"
                  label="Días para expiración del código"></v-text-field>
              </div>
              <div>
                Fecha de expiración: {{ getDate() }}
              </div>
            </v-col>

          </v-row>
          <v-row>
            <v-divider :thickness="1" class="border-opacity-100"></v-divider>
          </v-row>
          <v-row>
            <v-col>
              <div class="">
                <v-text-field @input="generateBarCode" v-model="amountValue" type="number" label="Monto" prefix="$"
                  :maxlength="amountLenght" counter>
                  <template v-slot:append>
                    <v-btn variant="text">
                      ?
                      <v-tooltip activator="parent" location="top">Se rellenan con ceros las posiciones faltantes. 
                        Se debe especificar si tiene decimales (solo 2 decimales permitidos). Ejemplo: $150.00
                        </v-tooltip>
                    </v-btn>
                  </template>

                </v-text-field>
              </div>
              <v-slider label="Longitud" v-model="amountLenght" :max="12" :min="1" class="align-center" step="1"
                hide-details>
                <template v-slot:append>
                  <v-text-field v-model="amountLenght" density="compact" style="width: 70px" type="number" hide-details
                    single-line></v-text-field>
                </template>
              </v-slider>
            </v-col>
          </v-row>
          <v-row>
            <v-divider :thickness="1" class="border-opacity-100"></v-divider>
          </v-row>
          <v-row>
            <v-col>
              <div>
                Digito identificador: {{ getBarCode() }}
              </div>
            </v-col>
          </v-row>
          <v-row class="mb-2">
            <v-divider :thickness="1" class="border-opacity-100"></v-divider>
          </v-row>
          <v-row class="justify-center mt-2">
            <canvas ref="canvas" id="barcodeCanvas" width="400" height="100"></canvas>
          </v-row>
        </v-container>
      </v-card-text>
    </v-card>
    <v-alert v-if="overLength > 32" color="error" icon="$error" title="Longitud excedida"
      text="La longitud del código no puede superar los 32 digitos"></v-alert>
    <v-alert v-if="belowLength < 18" color="error" icon="$error" title="Longitud insuficiente"
      text="La longitud del código debe ser de al menos 18 digitos"></v-alert>
  </div>

</template>
<style scoped></style>
