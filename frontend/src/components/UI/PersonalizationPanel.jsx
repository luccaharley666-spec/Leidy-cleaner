import React, { useContext, useState } from 'react';
import { ThemeContext } from '../../context/ThemeContext';

export default function [REDACTED_TOKEN]() {
  const { accent, setAccent, fontScale, setFontScale } = useContext(ThemeContext);
  const [r, g, b] = accent;

  return (
    <div className="card">
      <h4 className="font-semibold mb-2">Personalização</h4>
      <div className="space-y-3">
        <div>
          <label className="block text-sm text-muted">Cor principal</label>
          <input type="color" value={rgbToHex(accent)} onChange={(e) => setAccent(hexToRgb(e.target.value))} />
        </div>
        <div>
          <label className="block text-sm text-muted">Tamanho da fonte</label>
          <select value={fontScale} onChange={(e) => setFontScale(Number(e.target.value))} className="ml-2">
            <option value={0.9}>Pequena</option>
            <option value={1}>Padrão</option>
            <option value={1.1}>Grande</option>
            <option value={1.2}>Maior</option>
          </select>
        </div>
      </div>
    </div>
  );
}

function componentToHex(c) {
  const hex = c.toString(16);
  return hex.length == 1 ? '0' + hex : hex;
}

function rgbToHex([r,g,b]){
  return '#'+componentToHex(r)+componentToHex(g)+componentToHex(b);
}

function hexToRgb(hex){
  hex = hex.replace('#','');
  const bigint = parseInt(hex,16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return [r,g,b];
}
