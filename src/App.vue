<script setup>
import { computed, ref } from 'vue';
import JsBarcode from 'jsbarcode';
import addDays from 'date-fns/addDays';
const identifierPrefix = ref(0);
/* const referenceLenght = ref(8);
const referenceValue = ref('000000000'); */
const noClient = ref(0);
const noCredit = ref(0);
const noPayment = ref(0);
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
  const code = identifierPrefix.value + encodeInput(noClient.value, noCredit.value, noPayment.value) + getDate(true) + getformatedAmount(amountValue.value);
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


function encodeInput(noClient, noCredit, noPayment) {
  const noClientStr = String(Number(noClient)).padStart(5, '0');
  const noCreditStr = String(Number(noCredit)).padStart(6, '0');
  const noPaymentStr = String(Number(noPayment)).padStart(3, '0');
  
  return noClientStr + noCreditStr + noPaymentStr;
}

function decodeInput(cadena) {
  const noClient = Number(cadena.substring(0, 5));
  const noCredit = Number(cadena.substring(5, 11));
  const noPayment = Number(cadena.substring(11, 14));
  
  return { noClient, noCredit, noPayment };
}


const isActive = ref(false);
</script>

<template>

  <sui-button
  toggle
  content="Vote"
  :active="isActive"
  @click="isActive = !isActive"
  />

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
                <v-text-field @input="generateBarCode" v-model="noClient" type="number" :maxlength="5" counter
                  label="No. de cliente"></v-text-field>
                <v-text-field @input="generateBarCode" v-model="noCredit" type="number" :maxlength="6" counter
                  label="No. de credito"></v-text-field>
                <v-text-field @input="generateBarCode" v-model="noPayment" type="number" :maxlength="3" counter
                  label="No. de pago"></v-text-field>
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
                  :maxlength="7" counter>
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
  </div>

</template>
<style scoped></style>
