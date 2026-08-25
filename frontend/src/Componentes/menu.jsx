import {
LayoutDashboard,
FileText,
Clipboard,
Settings,
Mail,
Bell
} from 'lucide-react';
import { NavLink } from "react-router-dom";


const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/' },
  { label: 'Orçamentos', icon: FileText, path: '/Orcamentos' },
  { label: 'Papel', icon: Clipboard, path: '/papel' },
  { label: 'Configuração', icon: Settings, path: '/configuracao' },
];

function Menu(){

    return(
    <div className='navbar'> 
       <div className='navBar-Cima'>
        <div className='conteudoPerfil'>
        <Mail className='icone'/>
        <Bell className='icone'/>
        <div className='perfil'></div>
       </div>
       </div>
       <div className='navBar-Lateral'>

        <div className='logoNome'>
        <img className='logoimg' src="/logo.svg" alt="logo_img" />
        <img src="/logoImag.svg" alt="logo_img" />
        </div>

        <nav className="navegacao">
         {navItems.map((item) => { // map (tipo for) me tras um item do array e
          const Icon = item.icon; // coloca em Icon
          
          return(
          <NavLink  
            key={item.label} // label = titulo
            to={item.path}  //path = pasta
            className = {({isActive}) =>  
              isActive ? "menuItem ativo" : "menuItem"
            }          //     Ativa   ou     Não ativa
            >

            <Icon size={20}/>
            {item.label}
            </NavLink>
          )
         })}
      </nav>
    </div>
  </div>
    )
}

export default Menu