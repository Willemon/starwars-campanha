// node dev/testes/verificar-imagens-biblioteca.cjs
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.join(__dirname, '../..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const context = vm.createContext({ window: {} });
for (const file of ['js/dados/biblioteca.js', 'js/dados/imagens-biblioteca.js', 'js/icones.js']) {
    vm.runInContext(read(file), context);
}
const powers = vm.runInContext('LIBRARY_DATA.forcePowers.items', context);
const imageFor = name => vm.runInContext(`getLibraryImageUrl(${JSON.stringify(name)}, 'forcePowers')`, context);
for (const [folder, files] of Object.entries(context.window.LIBRARY_IMAGE_FILES)) {
    for (const file of Object.values(files)) {
        assert.ok(fs.existsSync(path.join(root, 'img', folder, file)), `Imagem ausente: ${folder}/${file}`);
    }
}
const sources = JSON.parse(read('dev/referencias/poderes/icones-jedipedia.json'));
for (const source of sources) {
    const stem = source.file.replace(/\.png$/, '');
    const name = powers.find(power => vm.runInContext(`toImageSlug(${JSON.stringify(power.match(/\(([^()]*)\)$/)?.[1])})`, context) === stem);
    assert.ok(name, `Imagem sem poder correspondente: ${source.file}`);
    assert.equal(imageFor(name), `img/poderes/${source.file}`, name);
    const bytes = fs.readFileSync(path.join(root, imageFor(name)));
    assert.equal(bytes.subarray(0, 8).toString('hex'), '89504e470d0a1a0a', `PNG inválido: ${source.file}`);
    assert.equal(bytes.readUInt32BE(16), 56, `Largura original: ${source.file}`);
    assert.equal(bytes.readUInt32BE(20), 56, `Altura original: ${source.file}`);
    assert.equal(new URL(source.page).hostname, 'swtor.jedipedia.net');
    assert.equal(new URL(source.imageUrl).hostname, 'swtorfiles.jedipedia.net');
}
for (const english of ['Circle of Shelter', 'Kinetic Combat']) {
    const name = powers.find(power => power.endsWith(`(${english})`));
    assert.ok(imageFor(name), `Imagem local reconhecida: ${english}`);
}
console.log(`${sources.length} ícones da Jedipedia: PNGs íntegros, fontes e vínculos da Biblioteca: OK.`);
